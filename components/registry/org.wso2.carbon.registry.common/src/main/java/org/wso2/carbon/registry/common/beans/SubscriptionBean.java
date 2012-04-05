/*
 * Copyright (c) 2006, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

package org.wso2.carbon.registry.common.beans;

import edu.umd.cs.findbugs.annotations.SuppressWarnings;
import org.wso2.carbon.registry.common.beans.utils.SubscriptionInstance;

@SuppressWarnings({"EI_EXPOSE_REP", "EI_EXPOSE_REP2"})
public class SubscriptionBean {

    private SubscriptionInstance[] instances;

    protected String errorMessage;

    private boolean loggedIn;

    private String pathWithVersion;

    public static class UserAccessLevel {
        public static final int AUTHORIZE = 3;
        public static final int DELETE = 2;
        public static final int READ = 1;
        public static final int NONE = 0;
    }

    private int userAccessLevel;

    private int roleAccessLevel;

    private String userName;

    private String[] roles;

    private boolean versionView;

    public boolean getVersionView() {
        return versionView;
    }

    public void setVersionView(boolean versionView) {
        this.versionView = versionView;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String[] getRoles() {
        return roles;
    }

    public void setRoles(String[] roles) {
        this.roles = roles;
    }

    public int getUserAccessLevel() {
        return userAccessLevel;
    }

    public void setUserAccessLevel(int userAccessLevel) {
        this.userAccessLevel = userAccessLevel;
    }

    public int getRoleAccessLevel() {
        return roleAccessLevel;
    }

    public void setRoleAccessLevel(int roleAccessLevel) {
        this.roleAccessLevel = roleAccessLevel;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public SubscriptionInstance[] getSubscriptionInstances() {
        return instances;
    }

    public void setSubscriptionInstances(SubscriptionInstance[] instances) {
        this.instances = instances;
    }

    public boolean getLoggedIn() {
        return loggedIn;
    }

    public void setLoggedIn(boolean loggedIn) {
        this.loggedIn = loggedIn;
    }

    public String getPathWithVersion() {
        return pathWithVersion;
    }

    public void setPathWithVersion(String pathWithVersion) {
        this.pathWithVersion = pathWithVersion;
    }
}
