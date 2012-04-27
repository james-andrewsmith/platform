<%--
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
--%>
<%@ page import="org.wso2.carbon.cassandra.mgt.stub.cluster.xsd.ColumnFamilyStats" %>
<%@ page import="org.wso2.carbon.cassandra.mgt.stub.explorer.xsd.Column" %>
<%@ page import="org.wso2.carbon.cassandra.mgt.stub.ks.xsd.ColumnFamilyInformation" %>
<%@ page import="org.wso2.carbon.cassandra.mgt.stub.ks.xsd.KeyspaceInformation" %>
<%@ page import="org.wso2.carbon.cassandra.mgt.ui.CassandraAdminClientHelper" %>
<%@ page import="org.wso2.carbon.cassandra.mgt.ui.CassandraExplorerAdminClient" %>
<%@ page import="org.wso2.carbon.ui.CarbonUIMessage" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib uri="http://wso2.org/projects/carbon/taglibs/carbontags.jar" prefix="carbon" %>
<script type="text/javascript" src="js/cassandra_ui_util.js"></script>
<%
    response.setHeader("Cache-Control", "no-cache");
    String keyspace = request.getParameter("keySpace");
    String columnFamily = request.getParameter("columnFamily");
    String rowId = request.getParameter("rowId");
    String startKey = request.getParameter("startKey");
    String endKey = request.getParameter("endKey");
    boolean isReversed = Boolean.valueOf(request.getParameter("isReversed"));
    CassandraExplorerAdminClient cassandraExplorerAdminClient = null;

    try {
        KeyspaceInformation keyspaceInformation =
                CassandraAdminClientHelper.getKeyspaceInformation(config.getServletContext(),
                        session, keyspace);
        cassandraExplorerAdminClient =
                new CassandraExplorerAdminClient(config.getServletContext(), session);
    } catch (Exception e) {
        CarbonUIMessage uiMsg = new CarbonUIMessage(CarbonUIMessage.ERROR, e.getMessage(), e);
        session.setAttribute(CarbonUIMessage.ID, uiMsg);
    }

    //String columnFamily = request.getParameter("columnFamily");

    org.wso2.carbon.cassandra.mgt.stub.explorer.xsd.Column[] columns = cassandraExplorerAdminClient.
            getColumnsForRowName(keyspace, columnFamily, rowId, startKey, endKey, 3, isReversed);

    response.getWriter().print("[");
    boolean countStarted = false;
    for (Column column : columns) {
        if (countStarted) {
            response.getWriter().print(",");
        }
        response.getWriter().print("{ \"name\":\"" + column.getName() + "\"");
        response.getWriter().print(", \"value\":\"" + column.getValue() + "\" }");
        countStarted = true;
    }
    response.getWriter().print("]");

    // [{ name: "foo", value : "bar"}, ...... ]
    //response.getWriter().print("");
%>