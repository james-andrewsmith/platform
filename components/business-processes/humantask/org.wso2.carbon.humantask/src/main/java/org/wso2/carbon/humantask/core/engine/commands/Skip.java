/*
 * Copyright (c) 2012, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

package org.wso2.carbon.humantask.core.engine.commands;

import org.wso2.carbon.humantask.core.dao.GenericHumanRoleDAO;
import org.wso2.carbon.humantask.core.dao.TaskStatus;
import org.wso2.carbon.humantask.core.engine.runtime.api.HumanTaskRuntimeException;

import java.util.ArrayList;
import java.util.List;

/**
 * Skip operation.
 */
public class Skip extends AbstractHumanTaskCommand {

    public Skip(String callerId, Long taskId) {
        super(callerId, taskId);
    }

    /**
     * Checks the Pre-conditions before executing the task operation.
     */
    @Override
    protected void checkPreConditions() {
        checkForValidTask(this.getClass());
        if (!task.isSkipable()) {
            throw new HumanTaskRuntimeException(
                    String.format("The task[id:%d] is not a skippable task.", task.getId()));
        }
    }

    /**
     * Perform the authorization checks before executing the task operation.
     */
    @Override
    protected void authorise() {
        List<GenericHumanRoleDAO.GenericHumanRoleType> allowedRoles =
                new ArrayList<GenericHumanRoleDAO.GenericHumanRoleType>();
        allowedRoles.add(GenericHumanRoleDAO.GenericHumanRoleType.TASK_INITIATOR);
        allowedRoles.add(GenericHumanRoleDAO.GenericHumanRoleType.BUSINESS_ADMINISTRATORS);
        allowedRoles.add(GenericHumanRoleDAO.GenericHumanRoleType.STAKEHOLDERS);

        authoriseRoles(allowedRoles, this.getClass());
    }

    /**
     * Perform the state checks before executing the task operation.
     */
    @Override
    protected void checkState() {
        List<TaskStatus> allowedStates = new ArrayList<TaskStatus>();
        allowedStates.add(TaskStatus.CREATED);
        allowedStates.add(TaskStatus.READY);
        allowedStates.add(TaskStatus.RESERVED);
        allowedStates.add(TaskStatus.IN_PROGRESS);
        checkPreStates(allowedStates, this.getClass());
    }

    /**
     * Checks the post-conditions after executing the task operation.
     */
    @Override
    protected void checkPostConditions() {
        checkPostState(TaskStatus.OBSOLETE, this.getClass());
    }

    @Override
    public void execute() {
        checkPreConditions();
        authorise();
        checkState();
        task.skip();
        checkPostConditions();
    }
}
