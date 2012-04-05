/*
 * Copyright WSO2, Inc. (http://wso2.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.wso2.carbon.cloud.csg.service;

import org.apache.axis2.description.TransportOutDescription;
import org.apache.axis2.engine.AxisConfiguration;
import org.apache.axis2.engine.AxisEvent;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.synapse.SynapseConstants;
import org.wso2.carbon.cloud.csg.common.*;
import org.wso2.carbon.cloud.csg.transport.CSGTransportSender;
import org.wso2.carbon.mediation.initializer.AbstractServiceBusAdmin;
import org.wso2.carbon.proxyadmin.ProxyAdminException;
import org.wso2.carbon.proxyadmin.ProxyData;
import org.wso2.carbon.proxyadmin.service.ProxyServiceAdmin;
import org.wso2.carbon.service.mgt.ServiceAdmin;
import org.wso2.carbon.service.mgt.ServiceMetaData;

import java.net.SocketException;

/**
 * The class <code>CSGAdminService</code> service provides the operations for deploying the proxies
 * for out sliders. These proxies are the actual proxies that represent the internal
 */
public class CSGAdminService extends AbstractServiceBusAdmin {
    private static final Log log = LogFactory.getLog(CSGAdminService.class);

    /**
     * Deploy the proxy service
     *
     * @param metaData meta data associated with this proxy
     * @throws CSGException throws in case of an error
     */
    public void deployProxy(CSGServiceMetaDataBean metaData) throws CSGException {
        if (metaData == null) {
            handleException("CSG Service meta data is null");
        }
        try {
            ProxyData proxyData = createProxyData(metaData);
            new ProxyServiceAdmin().addProxy(proxyData);

            // enable CSG transport sender for this tenant if not already done so,
            // this has to done this way because Stratos has no mechanism to enable custom
            // transport senders, because all messages are supposed to go through ST out flow
            // we can get rid of this once Stratos has that capabilities
            if (getAxisConfig().getTransportOut(CSGConstant.CSG_TRANSPORT_NAME) == null) {
                enableCSGTransportSender(getAxisConfig());
            }
        } catch (Exception e) {
            handleException("Could not deploy the CSG service '" + metaData.getServiceName() + "'. "
                    + e.getMessage(), e);
        }
    }

    /**
     * Un deploy the proxy service
     *
     * @param serviceName the name of the proxy to un deploy
     * @throws CSGException throws in case of an error
     */
    public void unDeployProxy(String serviceName) throws CSGException {
        if (serviceName == null) {
            handleException("CSG service(proxy service) name is null");
        }
        try {
            new ProxyServiceAdmin().deleteProxyService(serviceName);
        } catch (ProxyAdminException e) {
            handleException("Could not delete the CSG service '" + serviceName + "'. "
                    + e.getMessage(), e);
        }
    }

    /**
     * Returns the thrift server connection param
     *
     * @return the thriftServer connection url
     * @throws CSGException In case the server is not running
     */
    public CSGThriftServerBean getThriftServerConnectionBean() throws CSGException {
        CSGThriftServerBean bean = null;
        try {
            String hostName = CSGUtils.getCSGThriftServerHostName();
            int port = CSGUtils.getCSGThriftServerPort();
            int timeOut = CSGUtils.getIntProperty(CSGConstant.CSG_THRIFT_CLIENT_TIMEOUT,
                    CSGConstant.DEFAULT_TIMEOUT);

            if (!CSGUtils.isServerAlive(hostName, port)) {
                handleException("Thrift server is not running on the host '" + hostName + "'" +
                        " in port '" + port + "'");
            }
            bean = new CSGThriftServerBean();
            bean.setHostName(hostName);
            bean.setPort(port);
            bean.setTimeOut(timeOut);
        } catch (SocketException e) {
            throw new CSGException(e);
        }
        return bean;
    }

    /**
     * Update the public proxy based on the new event of the back end service
     * @param serviceName service
     * @param eventType the new event type
     * @throws CSGException throws in case of an error
     */
    public void updateProxy(String serviceName, int eventType) throws CSGException {
        ProxyServiceAdmin proxyAdmin = new ProxyServiceAdmin();
        try {
            if (eventType == AxisEvent.SERVICE_REMOVE) {
                proxyAdmin.deleteProxyService(serviceName);
            } else if (eventType == AxisEvent.SERVICE_START) {
                proxyAdmin.startProxyService(serviceName);
            } else if (eventType == AxisEvent.SERVICE_STOP) {
                proxyAdmin.stopProxyService(serviceName);
            } else {
                if (log.isDebugEnabled()) {
                    log.debug("The event SERVICE_DEPLOY is supported for the service '" + serviceName + "'");
                }
            }
        } catch (ProxyAdminException e) {
            handleException("Could not update service proxy service '" + serviceName + "'", e);
        }
    }

    public CSGProxyToolsURLs getPublishedProxyToolsURLs(String serviceName, String domainName)
            throws CSGException {
        try {
            CSGProxyToolsURLs tools = new CSGProxyToolsURLs();
            ServiceMetaData data = new ServiceAdmin().getServiceData(serviceName);
            tools.setTryItURL(data.getTryitURL());
            tools.setWsdl11URL(data.getWsdlURLs()[0]);
            tools.setWsdl2URL(data.getWsdlURLs()[1]);
            tools.setEprArray(data.getEprs());
            return tools;
        } catch (Exception e) {
            handleException("Could not read the proxy service URL", e);
        }
        return null;
    }

    private ProxyData createProxyData(CSGServiceMetaDataBean proxyMetaData) throws CSGException {

        if (log.isDebugEnabled()) {
            log.debug("Creating the proxy data with following metadata");
            log.debug("Service Name : " + proxyMetaData.getServiceName());
            log.debug("CSGTransport endpoint : " + proxyMetaData.getEndpoint());
            log.debug("Has In Out operations? : " + proxyMetaData.isHasInOutMEP());
            log.debug("Enable MTOM? : " + proxyMetaData.isMTOMEnabled());
            log.debug("Has WS-Sec enabled ? : " + proxyMetaData.isWsSecEnabled());
            log.debug("Has WS-RM enabled ? : " + proxyMetaData.isWsRmEnabled());
            if (proxyMetaData.isWsSecEnabled()) {
                log.debug("WS-Sec policy : \n" + proxyMetaData.getSecPolicy());
            }
            if (proxyMetaData.isWsRmEnabled()) {
                log.debug("WS-RM policy : \n" + proxyMetaData.getRmPolicy());
            }
            log.debug("WSDL location : " + proxyMetaData.getWsdlLocation());
            log.debug("WSDL : \n" + proxyMetaData.getInLineWSDL());
        }

        ProxyData proxy = new ProxyData();
        proxy.setName(proxyMetaData.getServiceName());
        if (proxyMetaData.getInLineWSDL() != null) {
            proxy.setWsdlDef(proxyMetaData.getInLineWSDL());
        }

        // FIXME - this is the workaround for https://issues.apache.org/jira/browse/SYNAPSE-527 and
        // https://issues.apache.org/jira/browse/AXIS2-4196
        String inSeq =
                "<inSequence xmlns=\"" + SynapseConstants.SYNAPSE_NAMESPACE + "\">" +
                        "<property name=\"transportNonBlocking\" scope=\"axis2\" action=\"remove\"/>" +
                        "<property name=\"preserveProcessedHeaders\" value=\"true\"/>";

        if (proxyMetaData.isHasInOutMEP()) {
            proxy.setOutSeqXML(
                    "<outSequence xmlns=\"" + SynapseConstants.SYNAPSE_NAMESPACE + "\">" +
                            "<send/>" +
                            "</outSequence>");
        } else {
            inSeq = inSeq + "<property name=\"OUT_ONLY\" scope=\"axis2\" action=\"set\" value=\"true\"/>";
        }
        inSeq = inSeq + "</inSequence>";
        proxy.setInSeqXML(inSeq);
        proxy.setFaultSeqXML(
                "<faultSequence xmlns=\"" + SynapseConstants.SYNAPSE_NAMESPACE + "\">" +
                        "<log level=\"full\"/>" +
                        "<drop/>" +
                        "</faultSequence>");

        // add a dummy error code in order to make sure that we don't suspend the endpoint
        // for any type of error, the proxy is just a middle man and it has an in memory endpoint
        String endpointXML =
                "<endpoint xmlns=\"" + SynapseConstants.SYNAPSE_NAMESPACE + "\">" +
                        "<address uri=\"" + proxyMetaData.getEndpoint() + "\">" +
                        "<suspendOnFailure>" +
                        "<errorCodes>400207</errorCodes>" +
                        "<initialDuration>1000</initialDuration>"  +
                        "<progressionFactor>2</progressionFactor>" +
                        "<maximumDuration>64000</maximumDuration>" +
                        "</suspendOnFailure>" +
                        "</address>" +
                        "</endpoint>";
        proxy.setEndpointXML(endpointXML);

        return proxy;
    }

    private void handleException(String msg) throws CSGException {
        log.error(msg);
        throw new CSGException(msg);
    }

    private void handleException(String msg, Throwable t) throws CSGException {
        log.error(msg, t);
        throw new CSGException(msg, t);
    }

    private void enableCSGTransportSender(AxisConfiguration axisConfig)
            throws Exception {
        CSGTransportSender sender = new CSGTransportSender();
        TransportOutDescription transportOut =
                new TransportOutDescription(CSGConstant.CSG_TRANSPORT_NAME);
        transportOut.setSender(sender);
        axisConfig.addTransportOut(transportOut);
        transportOut.getSender().init(getConfigContext(), transportOut);
    }
}
