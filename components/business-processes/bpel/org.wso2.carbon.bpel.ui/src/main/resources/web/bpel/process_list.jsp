<%@ page import="org.apache.axis2.context.ConfigurationContext" %>
<%@ page import="org.apache.http.HttpStatus" %>
<%@ page import="org.wso2.carbon.CarbonConstants" %>
<%@ page import="org.wso2.carbon.bpel.stub.mgt.types.*" %>
<%@ page import="org.wso2.carbon.bpel.ui.BpelUIUtil" %>
<%@ page import="org.wso2.carbon.bpel.ui.clients.BPELPackageManagementServiceClient" %>
<%@ page import="org.wso2.carbon.bpel.ui.clients.ProcessManagementServiceClient" %>
<%@ page import="org.wso2.carbon.registry.resource.ui.Utils" %>
<%@ page import="org.wso2.carbon.ui.CarbonUIMessage" %>
<%@ page import="org.wso2.carbon.ui.CarbonUIUtil" %>
<%@ page import="org.wso2.carbon.utils.ServerConstants" %>
<!--
 ~ Copyright (c) 2010, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 ~
 ~ WSO2 Inc. licenses this file to you under the Apache License,
 ~ Version 2.0 (the "License"); you may not use this file except
 ~ in compliance with the License.
 ~ You may obtain a copy of the License at
 ~
 ~    http://www.apache.org/licenses/LICENSE-2.0
 ~
 ~ Unless required by applicable law or agreed to in writing,
 ~ software distributed under the License is distributed on an
 ~ "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 ~ KIND, either express or implied.  See the License for the
 ~ specific language governing permissions and limitations
 ~ under the License.
 -->

<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib uri="http://wso2.org/projects/carbon/taglibs/carbontags.jar" prefix="carbon" %>

<jsp:include page="../resources/resources-i18n-ajaxprocessor.jsp"/>

<%
    response.setHeader("Cache-Control",
            "no-store, max-age=0, no-cache, must-revalidate");
    // Set IE extended HTTP/1.1 no-cache headers.
    response.addHeader("Cache-Control", "post-check=0, pre-check=0");
    // Set standard HTTP/1.0 no-cache header.
    response.setHeader("Pragma", "no-cache");

    String backendServerURL = CarbonUIUtil.getServerURL(config.getServletContext(), session);
    ConfigurationContext configContext =
            (ConfigurationContext) config.getServletContext().getAttribute(CarbonConstants.CONFIGURATION_CONTEXT);
    String cookie = (String)session.getAttribute(ServerConstants.ADMIN_SERVICE_COOKIE);

    BPELPackageManagementServiceClient pkgClient;
    ProcessManagementServiceClient client = null;
    DeployedPackagesPaginated packageList;
    PaginatedProcessInfoList processInfoList = null;
    String processListFilter = null;
    String processListOrderBy = null;
    String parameters = "";
    int numberOfPages = 0;
    int pageNumberInt = 0;
    int linkNum = 0;

    String pageNumber = request.getParameter("pageNumber");
    String operation = request.getParameter("operation");
    String packageName = request.getParameter("packageName");

    boolean isAuthorizedToManagePackages =
                CarbonUIUtil.isUserAuthorized(request, "/permission/admin/manage/bpel/packages");
    boolean isAuthorizedToMonitor =
            CarbonUIUtil.isUserAuthorized(request, "/permission/admin/monitor/bpel");
    boolean isAuthorizedToManageProcesses = CarbonUIUtil.isUserAuthorized(request, "/permission/admin/manage/bpel/processes");


    if (isAuthorizedToManagePackages || isAuthorizedToMonitor ) {
        try{
            pkgClient = new BPELPackageManagementServiceClient(cookie, backendServerURL, configContext);
        } catch (Exception e) {
            response.setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
            CarbonUIMessage uiMsg = new CarbonUIMessage(CarbonUIMessage.ERROR, e.getMessage(), e);
            session.setAttribute(CarbonUIMessage.ID, uiMsg);
%>
<jsp:include page="../admin/error.jsp"/>
<%
            return;
        }


        if (isAuthorizedToMonitor || isAuthorizedToManageProcesses) {
        try{
            client = new ProcessManagementServiceClient(cookie, backendServerURL,
                                                        configContext, request.getLocale());
        } catch(Exception e) {
            response.setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
            CarbonUIMessage uiMsg = new CarbonUIMessage(CarbonUIMessage.ERROR, e.getMessage(), e);
            session.setAttribute(CarbonUIMessage.ID, uiMsg);
%>
<jsp:include page="../admin/error.jsp"/>
<%
            return;
        }
    }

        if(isAuthorizedToManagePackages && operation != null && packageName != null &&
           operation.equals("undeploy")) {
            try {
                UndeployStatus_type0 status = pkgClient.undeploy(packageName);
                if(status.equals(UndeployStatus_type0.FAILED)) {
                    response.setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
                    CarbonUIMessage uiMsg = new CarbonUIMessage(
                            CarbonUIMessage.ERROR,
                            "BPEL package "+ packageName +" undeployment failed.",
                            null);
                    session.setAttribute(CarbonUIMessage.ID, uiMsg);
%>
<jsp:include page="../admin/error.jsp"/>
<%
                    return;
                }
            } catch (Exception e) {
                response.setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
                CarbonUIMessage uiMsg = new CarbonUIMessage(CarbonUIMessage.ERROR, e.getMessage(), e);
                session.setAttribute(CarbonUIMessage.ID, uiMsg);
%>
<jsp:include page="../admin/error.jsp"/>
<%
                return;
            }

        }

    if (isAuthorizedToManageProcesses && operation != null && client != null) {
        String pid = request.getParameter("processID");
        if (operation.toLowerCase().trim().equals("retire")) {
            if (pid != null && pid.length() > 0) {
                try {
                    client.retireProcess(BpelUIUtil.stringToQName(pid));
                } catch (Exception e) {
                    response.setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
                    CarbonUIMessage uiMsg = new CarbonUIMessage(CarbonUIMessage.ERROR, e.getMessage(), e);
                    session.setAttribute(CarbonUIMessage.ID, uiMsg);
%>
<jsp:include page="../admin/error.jsp"/>
<%
            return;
        }
    }

} else if (operation.toLowerCase().trim().equals("activate")) {
    if (pid != null && pid.length() > 0) {
        try {
            client.activateProcess(BpelUIUtil.stringToQName(pid));
        } catch (Exception e) {
            response.setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
            CarbonUIMessage uiMsg = new CarbonUIMessage(CarbonUIMessage.ERROR, e.getMessage(), e);
            session.setAttribute(CarbonUIMessage.ID, uiMsg);
%>
<jsp:include page="../admin/error.jsp"/>
<%
                    return;
                }
            }
        }
    }

        if (isAuthorizedToMonitor || isAuthorizedToManageProcesses) {
        if(pageNumber == null) {
            pageNumber = "0";
        }
        try{
            pageNumberInt = Integer.parseInt(pageNumber);
        } catch (NumberFormatException ignored){
        }

        processListFilter = request.getParameter("filter");
        if(processListFilter == null || processListFilter.length() == 0){
            processListFilter = "name}}* namespace=*";
        }

        processListOrderBy = request.getParameter("order");
        if(processListOrderBy == null || processListOrderBy.length() == 0) {
            processListOrderBy = "-deployed";
        }

        parameters = "filter=" + processListFilter + "&order=" + processListOrderBy;

        try{
            processInfoList = client.getPaginatedProcessList(processListFilter, processListOrderBy, pageNumberInt);
            numberOfPages = processInfoList.getPages();
        } catch(Exception e) {
            response.setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
            CarbonUIMessage uiMsg = new CarbonUIMessage(CarbonUIMessage.ERROR, e.getMessage(), e);
            session.setAttribute(CarbonUIMessage.ID, uiMsg);
%>
<jsp:include page="../admin/error.jsp"/>
<%
            return;
        }
    }

        if (isAuthorizedToMonitor || isAuthorizedToManagePackages) {
            if(pageNumber == null) {
                pageNumber = "0";
            }

            try{
                pageNumberInt = Integer.parseInt(pageNumber);
            } catch (NumberFormatException ignored) {

            }

            try{
                packageList = pkgClient.getPaginatedPackageList(pageNumberInt);

                if(packageList != null) {
                    numberOfPages = packageList.getPages();
                } else {
                    numberOfPages = 0;
                }
            } catch (Exception e) {
                response.setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
                CarbonUIMessage uiMsg = new CarbonUIMessage(CarbonUIMessage.ERROR, e.getMessage(), e);
                session.setAttribute(CarbonUIMessage.ID, uiMsg);
%>
<jsp:include page="../admin/error.jsp"/>
<%
                return;
            }
        }
    }
%>
<fmt:bundle basename="org.wso2.carbon.bpel.ui.i18n.Resources">
    <carbon:breadcrumb
            label="bpel.packages"
            resourceBundle="org.wso2.carbon.bpel.ui.i18n.Resources"
            topPage="true"
            request="<%=request%>"/>
    <jsp:include page="../dialog/display_messages.jsp"/>
<div id="middle">
    <div id="process-list-main">
        <h2><fmt:message key="bpel.deployed_processes"/></h2>
        <div id="workArea">
            <div id="process-list">
<%
    if (isAuthorizedToMonitor || isAuthorizedToManageProcesses) {
        if(processInfoList != null && processInfoList.getProcessInfo() != null) {
%>
                <carbon:paginator pageNumber="<%=pageNumberInt%>" numberOfPages="<%=numberOfPages%>"
                  page="process_list.jsp" pageNumberParameterName="pageNumber"
                  resourceBundle="org.wso2.carbon.bpel.ui.i18n.Resources"
                  prevKey="prev" nextKey="next"
                  parameters="<%= parameters%>"/>

                <table id="processListTable" class="styledLeft" width="100%">      <!--Basic structure of the info table-->
                    <thead>
                        <tr>

<%
            if (isAuthorizedToManagePackages) {
%>
                            <th><fmt:message key="package.name"/></th>
<%
            }
 %>
                            <th><fmt:message key="processid"/></th>
                            <th><fmt:message key="version"/></th>
                            <th><fmt:message key="status"/></th>
                            <th><fmt:message key="deployed.date"/></th>
<%
            if(isAuthorizedToManageProcesses){
%>
                            <th><fmt:message key="manage"/></th>
<%
            }
%>
                        </tr>
                    </thead>
                    <tbody>
<%
            for(LimitedProcessInfoType processInfo : processInfoList.getProcessInfo()) {
                // We need to differentiate process operation links(anchor tags) to attach onclick event callback.
                // So here we are generating link based on a integer count.
                String linkID = "processOperation" + linkNum;
                linkNum++;
%>
<tr>
    <%
            if (isAuthorizedToManagePackages) {

    %>
    <td>
        <%
                    if (processInfo.getStatus().toString().trim().equals("ACTIVE")) {
        %>

        <a href="package_dashboard.jsp?packageName=<%=processInfo.getPackageName()%>"><%=processInfo.getPackageName()%>
        </a>

        <%
        } else {
        %>
        <%=processInfo.getPackageName()%>
        <%
        }
        %>
    </td>
     <%
    }
     %>
                            <td><a href="./process_info.jsp?Pid=<%=processInfo.getPid()%>"><%=processInfo.getPid()%></a></td> <!--./process_info.jsp?Pid=<%=processInfo.getPid()%>-->
                            <td><%=processInfo.getVersion()%></td>
                            <td><%=processInfo.getStatus().toString()%></td>
                            <td><%=processInfo.getDeployedDate().getTime().toString()%></td>
<%
                if(isAuthorizedToManageProcesses) {
                    if (processInfo.getOlderVersion() == 0) {
%>
                            <td>
<%
                    if(processInfo.getStatus().toString().trim().equals("ACTIVE")){
%>
                                <a id="<%=linkID%>" class="icon-link-nofloat" style="background-image:url(images/deactivate.gif);" href="<%=BpelUIUtil.getRetireLink(processInfo.getPid(), processListFilter, processListOrderBy, pageNumberInt)%>">Retire</a>
                                <script type="text/javascript">
                                    jQuery('#<%=linkID%>').click(function(){
                                        function handleYes<%=linkID%>(){
                                            window.location = jQuery('#<%=linkID%>').attr('href');
                                        }
                                        CARBON.showConfirmationDialog(
                                                "Do you want to retire process <%=processInfo.getPid()%>?",
                                                handleYes<%=linkID%>,
                                                null);
                                        return false;
                                    });
                                </script>
<%
                    } else {
%>
                                <a id="<%=linkID%>" class="icon-link-nofloat" style="background-image:url(images/activate.gif);" href="<%=BpelUIUtil.getActivateLink(processInfo.getPid(), processListFilter, processListOrderBy, pageNumberInt)%>">Activate</a>
                                <script type="text/javascript">
                                    jQuery('#<%=linkID%>').click(function(){
                                        function handleYes<%=linkID%>(){
                                            window.location = jQuery('#<%=linkID%>').attr('href');
                                        }
                                        CARBON.showConfirmationDialog(
                                                "Do you want to activate process <%=processInfo.getPid()%>?",
                                                handleYes<%=linkID%>,
                                                null);
                                        return false;
                                    });
                                </script>
<%
                    }
%>
                            </td>
<%
                    } else {
%>
                            <td></td>
<%
                }
            }
%>
                        </tr>
<%
            }
%>
                    </tbody>
                </table>
                <carbon:paginator pageNumber="<%=pageNumberInt%>" numberOfPages="<%=numberOfPages%>"
                                  page="process_list.jsp" pageNumberParameterName="pageNumber"
                                  resourceBundle="org.wso2.carbon.bpel.ui.i18n.Resources"
                                  prevKey="prev" nextKey="next"
                                  parameters="<%=parameters%>"/>
                <%
                } else {
                %>
                <p><fmt:message key="there.are.no.processes.available"/></p>
                <%
                    }
                } else {
                %>
                <p><fmt:message key="do.not.have.permission.to.view.process.details"/></p>
                <%
                    }
                %>
            </div>
        </div>
    </div>
</div>

</fmt:bundle>