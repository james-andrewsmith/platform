<!--
~ Copyright (c) 2005-2010, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
~
~ WSO2 Inc. licenses this file to you under the Apache License,
~ Version 2.0 (the "License"); you may not use this file except
~ in compliance with the License.
~ You may obtain a copy of the License at
~
~ http://www.apache.org/licenses/LICENSE-2.0
~
~ Unless required by applicable law or agreed to in writing,
~ software distributed under the License is distributed on an
~ "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
~ KIND, either express or implied. See the License for the
~ specific language governing permissions and limitations
~ under the License.
-->

<%@ page import="org.apache.axis2.context.ConfigurationContext" %>
<%@ page import="org.wso2.carbon.CarbonConstants" %>
<%@ page import="org.wso2.carbon.rssmanager.ui.beans.DatabasePermissions" %>
<%@ page import="org.wso2.carbon.rssmanager.ui.stub.types.DatabaseUser" %>
<%@ page import="org.wso2.carbon.ui.CarbonUIUtil" %>
<%@ page import="org.wso2.carbon.utils.ServerConstants" %>
<%@ page import="org.wso2.carbon.rssmanager.ui.RSSManagerClient" %>

<%
    RSSManagerClient client;
    String flag = request.getParameter("flag");
    String strDatabaseInsId = request.getParameter("dbInsId");
    int dbInsId = (strDatabaseInsId != null) ? Integer.parseInt(strDatabaseInsId) : 0;
    String strRssInsId = request.getParameter("rssInsId");
    int rssInsId = (strRssInsId != null) ? Integer.parseInt(strRssInsId) : 0;

    String backendServerUrl = CarbonUIUtil.getServerURL(
            getServletConfig().getServletContext(), session);
    ConfigurationContext configContext = (ConfigurationContext) config.
            getServletContext().getAttribute(CarbonConstants.CONFIGURATION_CONTEXT);
    String cookie = (String) session.getAttribute(ServerConstants.ADMIN_SERVICE_COOKIE);
    client = new AdminConsoleClient(cookie, backendServerUrl, configContext);

    try {
        if ("add".equals(flag)) {
            DatabasePermissions permissions = new DatabasePermissions();
            for (String priv : CommonUtil.getDatabasePrivilegeList()) {
                String value = request.getParameter(priv.toLowerCase());
                if (value != null) {
                    if (CommonUtil.getBooleanResponsePrivilegeList().contains(priv)) {
                        permissions.setPermission(priv, "Y");
                    } else if (CommonUtil.getBlobResponsePrivilegeList().contains(priv)) {
                        permissions.setPermission(priv, value);
                    } else if (CommonUtil.getIntegerResponsePrivilegeList().contains(priv)) {
                        permissions.setPermission(priv, Integer.parseInt(value));
                    } else if (CommonUtil.getStringResponsePrivilegeList().contains(priv)) {
                        permissions.setPermission(priv, value);
                    }
                } else {
                    if (CommonUtil.getBooleanResponsePrivilegeList().contains(priv)) {
                        permissions.setPermission(priv, "N");
                    } else if (CommonUtil.getBlobResponsePrivilegeList().contains(priv)) {
                        permissions.setPermission(priv, "");
                    } else if (CommonUtil.getIntegerResponsePrivilegeList().contains(priv)) {
                        permissions.setPermission(priv, 0);
                    } else if (CommonUtil.getStringResponsePrivilegeList().contains(priv)) {
                        permissions.setPermission(priv, "");
                    }
                }
            }

            String username = request.getParameter("username");
            String password = request.getParameter("password");

            DatabaseUser user = new DatabaseUser();
            user.setUsername(username);
            user.setUserId(0);
            user.setPassword(password);
            user.setRssInstanceId(rssInsId);
            client.createUserWithPrivileges(permissions, user, dbInsId);
            //client.createDatabaseUser(user, dbInsId);
        } else if ("delete".equals(flag)) {
            String strUserId = request.getParameter("userId");
            int userId = (strUserId != null) ? Integer.parseInt(strUserId) : 0;
            client.deleteUser(userId, dbInsId);
        } else if ("edit".equals(flag)) {
            String userIdString = request.getParameter("userId");
            int userId = (userIdString == null) ? 0 : Integer.parseInt(userIdString);
            DatabasePermissions permissions = new DatabasePermissions();
            for (String priv : CommonUtil.getDatabasePrivilegeList()) {
                String value = request.getParameter(priv.toLowerCase());
                if (value != null) {
                    if (CommonUtil.getBooleanResponsePrivilegeList().contains(priv)) {
                        permissions.setPermission(priv, "Y");
                    } else if (CommonUtil.getBlobResponsePrivilegeList().contains(priv)) {
                        permissions.setPermission(priv, value);
                    } else if (CommonUtil.getIntegerResponsePrivilegeList().contains(priv)) {
                        permissions.setPermission(priv, Integer.parseInt(value));
                    } else if (CommonUtil.getStringResponsePrivilegeList().contains(priv)) {
                        permissions.setPermission(priv, value);
                    }
                } else {
                    if (CommonUtil.getBooleanResponsePrivilegeList().contains(priv)) {
                        permissions.setPermission(priv, "N");
                    } else if (CommonUtil.getBlobResponsePrivilegeList().contains(priv)) {
                        permissions.setPermission(priv, "");
                    } else if (CommonUtil.getIntegerResponsePrivilegeList().contains(priv)) {
                        permissions.setPermission(priv, 0);
                    } else if (CommonUtil.getStringResponsePrivilegeList().contains(priv)) {
                        permissions.setPermission(priv, "");
                    }
                }
            }

            String username = request.getParameter("username");
            String password = request.getParameter("password");

            DatabaseUser user = new DatabaseUser();
            user.setUsername(username);
            user.setUserId(userId);
            user.setPassword(password);
            user.setRssInstanceId(rssInsId);
            client.editUserPrivileges(permissions, user, dbInsId);
        } else if ("createDS".equals(flag)) {
            String username = request.getParameter("username");
            String password = request.getParameter("password");
            String dbName = request.getParameter("dbName");
            String dsName = request.getParameter("dsName");

            DataSourceEntry ds = new DataSourceEntry();
            ds.setRssInstanceId(rssInsId);
            ds.setDbName(dbName);
            ds.setDataSourceName(dsName);
            ds.setUsername(username);
            ds.setPassword(password);

            client.createCarbonDataSource(ds);

        }
    }
    catch (Exception e) {

    }

%>
<script type="text/javascript">
    document.location.href = "users.jsp?dbInsId=<%=dbInsId%>&rssInsId=<%=rssInsId%>";
</script>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  