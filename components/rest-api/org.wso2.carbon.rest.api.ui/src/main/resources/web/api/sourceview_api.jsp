<%--
  ~  Copyright (c) 2008, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
  ~
  ~  Licensed under the Apache License, Version 2.0 (the "License");
  ~  you may not use this file except in compliance with the License.
  ~  You may obtain a copy of the License at
  ~
  ~        http://www.apache.org/licenses/LICENSE-2.0
  ~
  ~  Unless required by applicable law or agreed to in writing, software
  ~  distributed under the License is distributed on an "AS IS" BASIS,
  ~  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  ~  See the License for the specific language governing permissions and
  ~  limitations under the License.
  --%>
<%@page import="org.wso2.carbon.rest.api.ui.util.ApiEditorHelper" %>
<%@page import="org.wso2.carbon.rest.api.stub.types.carbon.APIData" %>
<%@page import="org.wso2.carbon.rest.api.stub.types.carbon.ResourceData" %>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1" %>
<%@ page import="java.util.ResourceBundle" %>
<%@ page import="org.wso2.carbon.rest.api.ui.client.RestApiAdminClient" %>
<%@ page import="org.wso2.carbon.ui.CarbonUIUtil" %>
<%@ page import="org.apache.axis2.context.ConfigurationContext" %>
<%@ page import="org.wso2.carbon.CarbonConstants" %>
<%@ page import="org.wso2.carbon.utils.ServerConstants" %>
<%@page import="java.util.List" %>

<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib uri="http://wso2.org/projects/carbon/taglibs/carbontags.jar" prefix="carbon" %>

<script src="../editarea/edit_area_full.js" type="text/javascript"></script>
<fmt:bundle basename="org.wso2.carbon.rest.api.ui.i18n.Resources">
    <%
        ResourceBundle bundle = ResourceBundle.getBundle(
                "org.wso2.carbon.rest.api.ui.i18n.Resources",
                request.getLocale());
        String url = CarbonUIUtil.getServerURL(this.getServletConfig()
                                                       .getServletContext(), session);
        ConfigurationContext configContext = (ConfigurationContext) config
                .getServletContext().getAttribute(
                        CarbonConstants.CONFIGURATION_CONTEXT);
        String cookie = (String) session
                .getAttribute(ServerConstants.ADMIN_SERVICE_COOKIE);
        RestApiAdminClient client = new RestApiAdminClient(
                configContext, url, cookie, bundle.getLocale());

        String apiName = "";
        String apiContext = "";
        String source = "";
        String sourceXml = "";

        String mode = request.getParameter("mode");
        List<ResourceData> resources = (List<ResourceData>) session.getAttribute("apiResources");
        ResourceData resourceArray[] = new ResourceData[resources.size()];

        apiContext = request.getParameter("apiContext");
        apiName = request.getParameter("apiName");
        if ("edit".equals(mode)) {

            APIData apiData = new APIData();
            apiData.setName(apiName);
            apiData.setContext(apiContext);
            apiData.setResources(resources.toArray(resourceArray));
            source = client.getApiSource(apiData);
            sourceXml = ApiEditorHelper.parseStringToPrettyfiedString(source);
        } else {
            APIData apiData = new APIData();
            apiData.setName(apiName != null ? apiName : "");
            apiData.setContext(apiContext != null ? apiContext : "/");
            apiData.setResources(resources.toArray(resourceArray));
            source = client.getApiSource(apiData);
            sourceXml = ApiEditorHelper.parseStringToPrettyfiedString(source);
        }
    %>

    <script type="text/javascript">

        function saveApi() {
            var source = editAreaLoader.getValue("api_source");

        <%if("edit".equals(mode)){%>
            jQuery.ajax({
                            type: "POST",
                            url: "savesource-ajaxprocessor.jsp",
                            data: { mode:"<%=mode%>", apiName:"<%=apiName%>", apiString:source },
                            success: function(data) {
                                CARBON.showInfoDialog("<fmt:message key="api.update.success"/> ", function() {
                                    document.location.href = "index.jsp";
                                });
                            }
                        });
        <%}
      else{%>
            jQuery.ajax({
                            type: "POST",
                            url: "savesource-ajaxprocessor.jsp",
                            data: { mode:"<%=mode%>", apiString:source },
                            success: function(data) {
                                CARBON.showInfoDialog("<fmt:message key="api.add.success"/> ", function() {
                                    document.location.href = "index.jsp";
                                });
                            }
                        });
        <%}
      %>
        }

        function cancelSequence() {
            jQuery.ajax({
                            type: "POST",
                            url: "cancel-ajaxprocessor.jsp",
                            success: function() {
                                document.location.href = "index.jsp";
                            }
                        });
        }

        function switchToDesignView() {
            var source = editAreaLoader.getValue("api_source");

            jQuery.ajax({
                            type: "POST",
                            url: "switchtodesign-ajaxprocessor.jsp",
                            data: { apiSource:source },
                            success: function(data) {
                                document.location.href = "manageAPI.jsp?mode=" + "<%=mode%>" + "&apiName=" + "<%=apiName%>";
                            }
                        });
        }
    </script>

    <carbon:jsi18n
            resourceBundle="org.wso2.carbon.rest.api.ui.i18n.Resources"
            request="<%=request%>"/>

    <carbon:breadcrumb
            label="api.source.header"
            resourceBundle="org.wso2.carbon.rest.api.ui.i18n.Resources"
            topPage="false"
            request="<%=request%>"/>

    <div id="middle">
        <h2><fmt:message key="api.source.header"/></h2>

        <div id="workArea">
            <form action="" method="post" id="api.source.form" name="apiSrcForm">
                <table class="styledLeft" cellspacing="0" cellpadding="0">
                    <thead>
                    <tr>
                        <th>
							<span style="float:left; position:relative; margin-top:2px;">
								<fmt:message key="api.source.view.text"/>
							</span>
                            <a href="#" onclick="switchToDesignView()" class="icon-link"
                               style="background-image:url(images/design-view.gif);">
                                <fmt:message key="api.switchto.design.text"/>
                            </a>
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td><font style="color:#333333; font-size:small;">
                            <fmt:message key="api.source.name.warning"/>
                        </font>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <textarea id="api_source" name="apiXML" style="border: 0px solid rgb(204, 204, 204); 
                            	width: 99%; height: 400px; margin-top: 5px;"><%=sourceXml%>
                            </textarea>
                        </td>
                    </tr>
                    <tr>
                        <td class="buttonRow">
                            <input type="button" class="button" onclick="javascript: saveApi();"
                                   value="<fmt:message key="api.source.button.save.text"/>"/>
                            <input type="button" class="button"
                                   onclick="javascript: cancelSequence(); return false;"
                                   value="<fmt:message key="api.source.button.cancel.text"/>"/>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </form>
        </div>
    </div>
    <script type="text/javascript">
        editAreaLoader.init({
                                id : "api_source"        // textarea id
                                ,syntax: "xml"            // syntax to be uses for highgliting
                                ,start_highlight: true        // to display with highlight mode on start-up
                            });
    </script>
</fmt:bundle>
