"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import axios from "axios";
import { Button } from "@/components/ui/button";
import TaskForm from "@/app/comps/taskForm";
import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { get } from "http";

interface PendingTasksSummary {
  pendingTasks: {
    title: String;
    priority: string;
    startTime: string;
    endTime: string;
  }[];
  totalTimeToFinish: number;
  totalTimeLapsed: number;
  pendingTasksCount: number;
}

interface Task {
  _id: string;
  title: string;
  priority: string;
  status: string;
  startTime: string;
  endTime: string;
}

export default function Page() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL;
  
  const [taskData, setTaskData] = useState<Object[]>([]);
  const [pendingTasksSummary, setPendingTasksSummary] = useState<PendingTasksSummary | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [statusFilter, setStatusFilter] = useState("status");
  const [priorityFilter, setPriorityFilter] = useState("priority");
  const [sortFilter, setSortFilter] = useState("sort");
  interface SummaryData {
    totalTasks: number;
    completedPercentage: number;
    pendingPercentage: number;
    avgCompletionTime: number;
  }

  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);

  const getTaskData=async(filters={})=>{
    try{
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${API_BASE_URL}/tasks/get-tasks${
        queryParams ? `?${queryParams}` : ""
      }`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          id: localStorage.getItem("userId") || "",
        },
      });
      console.log("Task Data:", response.data);
      if (response.data) {
        setTaskData(response.data.tasks);
      }
    }
    catch(err: any){
      console.error("Error:", err.response?.data || err.message || err);
    }
  }

  const getSummaryData=async()=>{
    try{
      const response = await axios.get(`${API_BASE_URL}/stats/summary-stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          id: localStorage.getItem("userId") || "",
        },
      });
      console.log("Summary Data:", response.data);
      if (response.data) {
        setSummaryData(response.data);
      }
    }
    catch(err: any){
      console.error("Error:", err.response?.data || err.message
      || err);
    }
  }

  const signOut = async() => {
    try{
      console.log(
        localStorage.getItem("token"),
        localStorage.getItem("userId")
      );
      const res = await fetch(`${API_BASE_URL}/auth/signout/`, {
        method: "POST",
        headers: new Headers({
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          id: localStorage.getItem("userId") || "",
          'Content-Type': 'application/json'
        })
      });
      
      if (res){
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        window.location.href = "/";
      }
    }
    catch(err: any){
      console.error("Error:", err.response?.data || err.message || err);
    }
  }

  const addTask = async(task: any) => {
    try{
      const res = await fetch(`${API_BASE_URL}/tasks/add-task`, {
        method: "POST",
        headers: new Headers({
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          id: localStorage.getItem("userId") || "",
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify(task)
      });
      
      if (res){
        setTaskData([...taskData, task]);
      }
    }
    catch(err: any){
      console.error("Error:", err.response?.data || err.message || err);
    }
  }

  const editTask = async (task: any) => {
    try {
      console.log(task)
      const res = await axios.put(`${API_BASE_URL}/tasks/update-task`, task, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          id: task._id,
        },
      }
      )

      if (res) {
        console.log("Task Updated:");
        setTaskData(
          taskData.map((item: any) =>
            item._id === task._id ? { ...item, ...task } : item
          )
        )
      }
    } catch (err: any) {
      console.error("Error:", err.response?.data || err.message || err);
    }
  };

  const deleteTask=async()=> {
    try{
      const res = await axios.delete(`${API_BASE_URL}/tasks/delete-task`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          id: selectedTask?._id,
        },
      });
      if (res){
        setTaskData(taskData.filter((item: any) => item._id !== selectedTask?._id));
        setOpenDelete(false);
      }
    }
    catch(err: any){
      console.error("Error:", err.response?.data || err.message || err);
    }
  }

  const getPendingTasksSummary = async() => {
    try{
      const res = await axios.get(`${API_BASE_URL}/stats/pending-tasks-summary`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          id: localStorage.getItem("userId"),
        },
      });
      if (res){
        setPendingTasksSummary(res.data);
      }
    }
    catch(err: any){
      console.error("Error:", err.response?.data || err.message || err);
    }
  }

  useEffect(() => {
    getTaskData();
    getPendingTasksSummary();
    getSummaryData();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

  // Open modal for Add Task
  const handleAddTask = () => {
    setSelectedTask(undefined);
    setIsModalOpen(true);
  };

  // Open modal for Edit Task
  const handleEditTask = (task: any) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Save Task
  const handleSaveTask = (task: any) => {
    if (selectedTask) {
      editTask(task);
    } else {
      addTask(task);
    }
  };

  useEffect(()=>{
    if(statusFilter!="status"){
      getTaskData({
        status: statusFilter
      });
    }
    else{
      getTaskData();
    }

    if (priorityFilter != "priority") {
      getTaskData({
        priority: priorityFilter,
      });
    }
    else{
      getTaskData();
    }

    if (sortFilter != "sort") {
      const [field, order] = sortFilter.split("-");
      getTaskData({
        sortBy: field,
        order:order,
      });
    }
    else{
      getTaskData();
    }
  },[statusFilter,priorityFilter,sortFilter])

  return (
    <div className="flex bg-[#1f1d1d]">
      <div className=" w-screen flex flex-col items-center mt-4">
        {/* Tabs */}
        <Tabs defaultValue="dashboard" className="w-full mt-2">
          <TabsList className="flex justify-center bg-transparent text-2xl">
            <TabsTrigger value="dashboard" className="text-white text-2xl underline">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-white text-2xl underline">
              Task List
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="dashboard"
            className="h-full flex flex-col justify-center text-white text-2xl mx-8 mt-6"
          >
            <div>
              <h2 className="text-white text-2xl mb-4 text-left text-semibold">
                Summary
              </h2>
              <div className="flex items-center justify-between w-10/12 my-4 ml-[8%]">
                <div className="flex flex-col items-center gap-2">
                  <p className=" text-2xl text-cyan-600">
                    {summaryData?.totalTasks}
                  </p>
                  <h3 className="text-white text-lg">Total Tasks</h3>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <p className=" text-2xl text-cyan-600">
                    {summaryData?.completedPercentage.toFixed(2)} %
                  </p>
                  <h3 className="text-white text-lg">Tasks Completed</h3>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <p className=" text-2xl text-cyan-600">
                    {summaryData?.pendingPercentage.toFixed(2)} %
                  </p>
                  <h3 className="text-white text-lg">Tasks Pending</h3>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <p className=" text-2xl text-cyan-600">
                    {summaryData?.avgCompletionTime} hrs
                  </p>
                  <h3 className="text-white text-lg">
                    Average time per completed task
                  </h3>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-white text-2xl mb-4 text-left text-semibold mt-8">
                Pending Tasks Summary
              </h2>
              <div className="flex items-center justify-between w-10/12 my-4 ml-[8%]">
                <div className="flex flex-col items-center gap-2">
                  <p className=" text-2xl text-cyan-600">
                    {pendingTasksSummary?.pendingTasksCount}
                  </p>
                  <h3 className="text-white text-lg">Total Pending Tasks</h3>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <p className=" text-2xl text-cyan-600">
                    {pendingTasksSummary?.totalTimeLapsed.toFixed(2)} hrs
                  </p>
                  <h3 className="text-white text-lg">Total time lapsed</h3>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <p className=" text-2xl text-cyan-600">
                    {pendingTasksSummary?.totalTimeToFinish} hrs
                  </p>
                  <h3 className="text-white text-lg">Total time to finish</h3>
                </div>
              </div>
            </div>

            <Table className="mb-6 w-1/2 max-w-4xl border-[1px] border-cyan-900 rounded-xl ml-[25vw] mt-10">
              <TableHeader className="bg-cyan-900">
                <TableRow className="text-white">
                  <TableHead className="text-white">Priority</TableHead>
                  <TableHead className="text-white">Title</TableHead>
                  <TableHead className="text-white">Task Number</TableHead>
                  <TableHead className="text-white">
                    Time Lapsed (hrs)
                  </TableHead>
                  <TableHead className="text-white">
                    Time to Finish (hrs)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingTasksSummary &&
                  pendingTasksSummary?.pendingTasks.map((task, index) => (
                    <TableRow key={index}>
                      <TableCell>{task.priority}</TableCell>
                      <TableCell>{task.title}</TableCell>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {(
                          (new Date().getTime() -
                            new Date(task.startTime).getTime()) /
                          (1000 * 60 * 60)
                        ).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {(
                          (new Date(task.endTime).getTime() -
                            new Date(task.startTime).getTime()) /
                          (1000 * 60 * 60)
                        ).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent
            value="tasks"
            className="h-full flex flex-col justify-center items-center p-6"
          >
            {/* <h2 className="text-white text-2xl mb-4 text-left text-semibold">Task List</h2> */}
            <div>
              <div className="flex justify-between w-full my-4">
                <div className="flex space-x-4 justify-between items-center w-full">
                  <Button
                    className="bg-cyan-800 rounded-lg text-white"
                    onClick={handleAddTask}
                  >
                    Add Task
                  </Button>

                  <div className="flex gap-4">
                    <div className="flex flex-col mb-4 gap-y-0.5">
                      <label className="text-gray-300 text-xs">Sort by:</label>
                      <select
                        value={sortFilter}
                        onChange={(e) => setSortFilter(e.target.value)}
                        className="border p-2 rounded-md border-cyan-800 text-cyan-800"
                      >
                        <option value="sort">Select</option>
                        <option value="startTime-asc">Start Time (Asc)</option>
                        <option value="startTime-desc">
                          Start Time (Desc)
                        </option>
                        <option value="endTime-asc">End Time (Asc)</option>
                        <option value="endTime-desc">End Time (Desc)</option>
                      </select>
                    </div>

                    <div className="flex flex-col mb-4 gap-y-0.5">
                      <label className="text-gray-300 text-xs">
                        Filter by Status:
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border p-2 rounded-md border-cyan-800 text-cyan-800"
                      >
                        <option value="status">Select</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div className="flex flex-col mb-4 gap-y-0.5">
                      <label className="text-gray-300 text-xs">
                        Filter by Priority:
                      </label>
                      <input
                        type="number"
                        placeholder="Priority"
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="border p-2 rounded-md border-cyan-800 text-cyan-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <Table className="w-fit max-w-4xl text-white border-[1px] border-cyan-900 rounded-xl">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white bg-cyan-900">
                      Task ID
                    </TableHead>
                    <TableHead className="text-white bg-cyan-900">
                      Title
                    </TableHead>
                    <TableHead className="text-white bg-cyan-900">
                      Priority
                    </TableHead>
                    <TableHead className="text-white bg-cyan-900">
                      Status
                    </TableHead>
                    <TableHead className="text-white bg-cyan-900">
                      Start Time
                    </TableHead>
                    <TableHead className="text-white bg-cyan-900">
                      End Time
                    </TableHead>
                    <TableHead className="text-white bg-cyan-900">
                      Total Time to Finish (hrs)
                    </TableHead>
                    <TableHead className="text-white bg-cyan-900">
                      Edit
                    </TableHead>
                    <TableHead className="text-white bg-cyan-900">
                      Delete
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {taskData &&
                    taskData?.map((task: any, itemId) => (
                      <TableRow key={itemId}>
                        <TableCell>{itemId + 1}</TableCell>
                        <TableCell>{task.title}</TableCell>
                        <TableCell>{task.priority}</TableCell>
                        <TableCell>{task.status}</TableCell>
                        <TableCell>
                          {new Date(task.startTime).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {new Date(task.endTime).toLocaleString()}
                        </TableCell>
                        <TableCell className="flex justify-center">
                          {(
                            (new Date(task.endTime).getTime() -
                              new Date(task.startTime).getTime()) /
                            (1000 * 60 * 60)
                          ).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <button
                            className="text-white bg-cyan-900 p-2 rounded-lg"
                            onClick={() => handleEditTask(task)}
                          >
                            Edit
                          </button>
                        </TableCell>
                        <TableCell>
                          <button
                            className="text-white bg-red-900 p-2 rounded-lg"
                            onClick={() => {
                              setSelectedTask(task);
                              setOpenDelete(true);
                            }}
                          >
                            Delete
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <TaskForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        selectedTask={selectedTask}
      />

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogTrigger />
        <DialogContent>
          <DialogTitle className="text-xl font-semibold">
            Are you sure?
          </DialogTitle>
          <p className="text-gray-600">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteTask}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        className="border-[1px] border-red-600 rounded-lg text-red-600 font-semibold m-4"
        onClick={signOut}
      >
        Sign out
      </Button>
    </div>
  );
}
