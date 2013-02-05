<%@ page import="org.json.simple.JSONObject" %>
<%@ page import="org.wso2.carbon.cassandra.cluster.mgt.ui.operation.ClusterNodeOperationsAdminClient" %>
<%@ page import="org.wso2.carbon.cassandra.cluster.mgt.ui.constants.ClusterUIConstants" %>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1" %>
<%
    JSONObject backendStatus = new JSONObject();
    backendStatus.put("success","no");
    try{
        String hostAddress=request.getParameter(ClusterUIConstants.HOST_ADDRESS);
        String type=request.getParameter(ClusterUIConstants.TYPE);
        ClusterNodeOperationsAdminClient clusterNodeOperationsAdminClient =new ClusterNodeOperationsAdminClient(config.getServletContext(),session);
        clusterNodeOperationsAdminClient.stopCompaction(hostAddress,type);
        backendStatus.put("success","yes");
    }catch (Exception e)
    {}
    out.print(backendStatus);
    out.flush();
%>