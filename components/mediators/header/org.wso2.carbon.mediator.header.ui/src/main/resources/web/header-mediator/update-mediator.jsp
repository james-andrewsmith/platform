<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1" %>
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

<%@ page import="org.wso2.carbon.mediator.header.HeaderMediator" %>
<%@ page import="org.apache.synapse.util.xpath.SynapseXPath" %>
<%@ page import="org.wso2.carbon.sequences.ui.util.SequenceEditorHelper" %>
<%@ page import="org.wso2.carbon.sequences.ui.util.ns.QNameFactory" %>
<%@ page import="org.wso2.carbon.sequences.ui.util.ns.XPathFactory" %>
<%@ page import="javax.xml.namespace.QName" %>
<%@ page import="org.wso2.carbon.mediator.service.ui.Mediator" %>

<%
    Mediator mediator = SequenceEditorHelper.getEditingMediator(request, session);
    SynapseXPath xpath = null;
    String name = null;
    String action = null;
    if (!(mediator instanceof HeaderMediator)) {
        // todo : proper error handling
        throw new RuntimeException("Unable to edit the mediator");
    }
    HeaderMediator headerMediator = (HeaderMediator) mediator;
    name = request.getParameter("mediator.header.name");

    if (name != null && !name.equals("")){
        QName qname = QNameFactory.getInstance().createQName("mediator.header.name", request, session);
        if (qname != null) {
            headerMediator.setQName(qname);
        } else {
            headerMediator.setQName(new QName(name));
        }
    }

    headerMediator.setExpression(null);
    headerMediator.setValue(null);

    action = request.getParameter("mediator.header.action");
    if (action != null && !action.equals("")) {
        if (action.equals("set")) {
            headerMediator.setAction(HeaderMediator.ACTION_SET);
            String actionType = request.getParameter("mediator.header.actionType");
            if (actionType != null && !actionType.equals("")) {
                if (actionType.equals("expression")) {
                    XPathFactory xPathFactory = XPathFactory.getInstance();
                    headerMediator.setExpression(xPathFactory.createSynapseXPath("mediator.header.val_ex", request, session));
                } else if (actionType.equals("value")) {
                    headerMediator.setValue(request.getParameter("mediator.header.val_ex"));
                }
            }
        } else if (action.equals("remove")) {
            headerMediator.setAction(HeaderMediator.ACTION_REMOVE);
        }
    }
%>

