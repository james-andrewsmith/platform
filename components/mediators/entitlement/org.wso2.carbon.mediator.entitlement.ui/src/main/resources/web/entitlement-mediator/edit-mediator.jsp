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

<%@ page import="org.apache.axis2.context.ConfigurationContext" %>
<%@ page import="org.wso2.carbon.CarbonConstants" %>
<%@ page import="org.wso2.carbon.mediator.service.ui.Mediator" %>
<%@ page import="org.wso2.carbon.sequences.ui.util.SequenceEditorHelper" %>
<%@ page import="org.wso2.carbon.ui.CarbonUIMessage" %>
<%@ page import="org.wso2.carbon.ui.CarbonUIUtil" %>
<%@ page import="org.wso2.carbon.utils.ServerConstants" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt"%>
<%@ taglib uri="http://wso2.org/projects/carbon/taglibs/carbontags.jar" prefix="carbon"%>

<%
		String remoteServiceUserName = null;
		String remoteServicePassword = null;
		String remoteServiceUrl = null;

		try {
            Mediator mediator = SequenceEditorHelper.getEditingMediator(request, session);
            if (!(mediator instanceof EntitlementMediator)) {
                throw new RuntimeException("Unable to update the mediator");
            }
            EntitlementMediator entMediator = (EntitlementMediator)mediator;
            remoteServiceUrl = entMediator.getRemoteServiceUrl();
            if(remoteServiceUrl==null){
            	remoteServiceUrl ="";
            }
            remoteServiceUserName = entMediator.getRemoteServiceUserName();
            if(remoteServiceUserName==null){
            	remoteServiceUserName ="";
            }
            remoteServicePassword = entMediator.getRemoteServicePassword();
            if(remoteServicePassword==null){
            	remoteServicePassword ="";
            }
        } catch (Exception e) {
            CarbonUIMessage.sendCarbonUIMessage(e.getMessage(), CarbonUIMessage.ERROR, request, e);
 %>
            
<%@page import="org.wso2.carbon.mediator.entitlement.EntitlementMediator"%><script type="text/javascript">
                   location.href = "../admin/error.jsp";
            </script>
    <%
            return;
        }
%>

<fmt:bundle basename="org.wso2.carbon.mediator.entitlement.ui.i18n.Resources">
    <carbon:jsi18n
        resourceBundle="org.wso2.carbon.mediator.entitlement.ui.i18n.JSResources"
        request="<%=request%>"
        i18nObjectName="enti18n"/>    
<div>
    <script type="text/javascript" src="../entitlement-mediator/js/mediator-util.js"></script>

    <table class="normal" width="100%">
        <tr>
            <td>
                <h2><fmt:message key="mediator.ent.header"/></h2>
            </td>
        </tr>

        <tr>
            <td>
                <table style="width: 100%">
                    <tr>
                        <td class="leftCol-small">
                            <fmt:message key="mediator.ent.remoteservice"/>
                        </td>
                        <td class="text-box-big">
                        <input type="text" id="remoteServiceUrl" name="remoteServiceUrl" value="<%=remoteServiceUrl%>" />
                        </td>
                    </tr>
                      <tr>
                        <td class="leftCol-small">
                            <fmt:message key="mediator.ent.remoteservice.user"/>
                        </td>
                        <td class="text-box-big">
                        <input type="text" id="remoteServiceUserName" name="remoteServiceUserName" value="<%=remoteServiceUserName%>" />
                        </td>
                    </tr>
                      <tr>
                        <td class="leftCol-small">
                            <fmt:message key="mediator.ent.remoteservice.password"/>
                        </td>
                        <td class="text-box-big">
                        <input type="password" id="remoteServicePassword" name="remoteServicePassword" value="<%=remoteServicePassword%>" />
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</div>
</fmt:bundle>