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
<%@ page import="org.wso2.carbon.rssmanager.common.RSSManagerCommonUtil" %>
<%@ page import="org.wso2.carbon.rssmanager.ui.RSSManagerClient" %>
<%@ page import="org.wso2.carbon.rssmanager.ui.stub.types.RSSInstance" %>
<%@ page import="org.wso2.carbon.ui.CarbonUIUtil" %>
<%@ page import="org.wso2.carbon.utils.ServerConstants" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib uri="http://wso2.org/projects/carbon/taglibs/carbontags.jar" prefix="carbon" %>

<script type=text/javascript src="js/uiValidator.js"></script>

<fmt:bundle basename="org.wso2.carbon.rssmanager.ui.i18n.Resources">
    <link rel="stylesheet" type="text/css" href="../resources/css/registry.css"/>

    <carbon:breadcrumb
            label="Edit Database Instance"
            resourceBundle="org.wso2.carbon.rssmanager.ui.i18n.Resources"
            topPage="false"
            request="<%=request%>"/>
    <%
        String instanceType = request.getParameter("instanceType");
        String strRssInsId = request.getParameter("rssInsId");

        int rssInsId = (strRssInsId != null) ? Integer.parseInt(strRssInsId) : 0;

        String backendServerUrl = CarbonUIUtil.getServerURL(
                getServletConfig().getServletContext(), session);
        ConfigurationContext configContext = (ConfigurationContext) config.
                getServletContext().getAttribute(CarbonConstants.CONFIGURATION_CONTEXT);
        String cookie = (String) session.getAttribute(ServerConstants.ADMIN_SERVICE_COOKIE);
        RSSManagerClient client = new RSSManagerClient(cookie, backendServerUrl, configContext,
                request.getLocale());
        RSSInstance rssIns = null;
        try {
            rssIns = client.getRSSInstanceById(rssInsId);
        } catch (Exception e) {
        }

        if (rssIns != null) {
    %>

    <div id="middle">
        <h2><fmt:message key="rss.manager.edit.instance.info"/></h2>

        <div id="workArea">

            <form method="post" action="#" name="editInstanceForm"
                  id="editInstanceForm" onsubmit="return validateEditInstanceProperties()">
                <table class="styledLeft">
                    <tr>
                        <td>
                            <table class="normal">
                                <tr>
                                    <td class="leftCol-med"><fmt:message
                                            key="rss.manager.instance.name"/><font
                                            color='red'>*</font></td>
                                    <td><input value="<%=rssIns.getName()%>" id="instanceName"
                                               name="instanceName"
                                               size="30" type="text" readonly="readonly"></td>
                                    <input id="rssInsId" name="rssInsId" type="hidden"
                                           value="<%=rssIns.getRssInstanceId()%>"/>
                                </tr>
                                <tr>
                                    <td class="leftCol-med"><fmt:message
                                            key="rss.manager.instance.type"/>
                                        <font color="red">*</font>
                                    </td>
                                    <td><label>
                                        <select name="databaseEngine" id="databaseEngine"
                                                onchange="setJDBCValues(this,document)">
                                            <%
                                                instanceType = RSSManagerCommonUtil.getDatabasePrefix(rssIns.getServerURL().toLowerCase());
                                                if ("".equals(instanceType)) { %>
                                            <option value="#" selected="selected">--SELECT--
                                            </option>
                                            <% } else { %>
                                            <option value="">--SELECT--</option>
                                            <% }
                                                if ("mysql".equals(instanceType)) { %>
                                            <option id="mysql" selected="selected"
                                                    value="jdbc:mysql://[machine-name/ip]:[port]#com.mysql.jdbc.Driver">
                                                MySQL
                                            </option>
                                            <% } else { %>
                                            <option id="mysql"
                                                    value="jdbc:mysql://[machine-name/ip]:[port]#com.mysql.jdbc.Driver">
                                                MySQL
                                            </option>
                                            <% } %>
                                        </select>
                                    </label>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="leftCol-med"><fmt:message
                                            key="rss.manager.server.category"/>
                                        <font color="red">*</font>
                                    </td>
                                    <td><label>
                                        <select name="serverCategory" id="serverCategory">
                                            <% if ("".equals(rssIns.getServerCategory())) { %>
                                            <option selected=selected value="#">--SELECT--</option>
                                            <%} else { %>
                                            <option value="#">--SELECT--</option>
                                            <% }
                                                if ("RDS".equals(rssIns.getServerCategory())) {%>
                                            <option selected="selected" value="RDS">RDS</option>
                                            <% } else {%>
                                            <option value="RDS">RDS</option>
                                            <% }
                                                if ("LOCAL".equals(rssIns.getServerCategory())) { %>
                                            <option selected="selected" value="LOCAL">LOCAL</option>
                                            <% } else { %>
                                            <option value="LOCAL">LOCAL</option>
                                            <% } %>
                                        </select>
                                    </label>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="left"><fmt:message
                                            key="rss.manager.instance.url"/><font
                                            color='red'>*</font></td>
                                    <td><input value="<%=rssIns.getServerURL()%>" id="instanceUrl"
                                               name="instanceUrl"
                                               size="60" type="text"></td>
                                </tr>
                                <tr>
                                    <td class="leftCol-med"><fmt:message
                                            key="rss.manager.instance.username"/><font
                                            color='red'>*</font></td>
                                    <td><input value="<%=rssIns.getAdminUsername()%>" id="username"
                                               name="username"
                                               size="30" type="text"></td>
                                </tr>
                                <tr>
                                    <td align="left"><fmt:message
                                            key="rss.manager.instance.password"/><font
                                            color='red'>*</font></td>
                                    <td><input id="password"
                                               name="password"
                                               size="30" type="password"
                                               value="<%=rssIns.getAdminPassword()%>"></td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>

                        <td class="buttonRow" colspan="3">
                            <div id="connectionStatusDiv" style="display: none;"></div>
                            <input type="hidden" id="flag" name="flag" value="edit"/>
                            <input class="button" type="button"
                                   value="<fmt:message key="rss.manager.test.connection"/>"
                                   onclick="return testConnection();"/>

                            <input class="button" type="button"
                                   onclick="return validateEditInstanceProperties();"
                                   value="<fmt:message key="rss.manager.save"/>"/>

                            <input class="button" type="button"
                                   value="<fmt:message key="rss.manager.cancel"/>"
                                   onclick="document.location.href = 'instances.jsp'"/>
                        </td>

                    </tr>
                </table>
            </form>
        </div>
    </div>

    <%
    } else {

    %>
    <script type="text/javascript">
        document.location.href = "instances.jsp";
    </script>
    <%
        }
    %>
</fmt:bundle>