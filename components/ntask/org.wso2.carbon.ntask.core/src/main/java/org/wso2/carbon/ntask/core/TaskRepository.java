/**
 *  Copyright (c) 2011, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
package org.wso2.carbon.ntask.core;

import java.util.List;

import org.wso2.carbon.ntask.common.TaskException;

/**
 * This interface represents a task repository, which can be used to store and load tasks. 
 */
public interface TaskRepository {

	/**
	 * Returns all the task information data in the repository.
	 * @return A list of TaskInfo objects
	 * @throws TaskException
	 */
	public List<TaskInfo> getAllTasks() throws TaskException;
	
	/**
	 * Returns task information of a given task name
	 * @param taskName The task name
	 * @return The task information object
	 * @throws TaskException
	 */
	public TaskInfo getTask(String taskName) throws TaskException;
	
	/**
	 * Adds given task information to the repository. 
	 * @param taskInfo The task information object
	 * @throws TaskException
	 */
	public void addTask(TaskInfo taskInfo) throws TaskException;
	
	/**
	 * Deletes existing task information from the repository.
	 * @param taskName The task name
	 * @throws TaskException
	 */
	public void deleteTask(String taskName) throws TaskException;
	
	/**
	 * Returns the type of the tasks represented by this task manager.
	 * @return The type of the tasks
	 */
	public String getTasksType();
	
}
