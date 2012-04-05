/*
 * Copyright (c), WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.wso2.carbon.humantask.core.dao;

import java.util.Date;

/**
 * DAO class for deadlines
 */
public interface DeadlineDAO {
    /**
     * Set the deadline name
     * @param name name of the deadline
     */
    public void setName(String name);

    /**
     * Get the deadline name
     * @return Deadline name
     */
    public String getName();
    /**
     * Set the deadline date
     * @param deadlineDate deadline
     */
    public void setDeadlineDate(Date deadlineDate);

    /**
     * Get the deadline date
     * @return Deadline
     */
    public Date getDeadlineDate();
    /**
     * Set the status
     * @param status Status of the deadline
     */
    public void setStatus(TaskStatus status);

    /**
     * Set the task
     * @param task Task
     */
    public void setTask(TaskDAO task);
}
