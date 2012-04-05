/*
*  Copyright (c) 2005-2010, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
*  WSO2 Inc. licenses this file to you under the Apache License,
*  Version 2.0 (the "License"); you may not use this file except
*  in compliance with the License.
*  You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/
package org.wso2.carbon.security.config;

import org.apache.axiom.om.OMAbstractFactory;
import org.apache.axiom.om.OMElement;
import org.apache.axiom.om.OMFactory;
import org.apache.axiom.om.OMNode;
import org.apache.axiom.om.util.UUIDGenerator;
import org.apache.axis2.AxisFault;
import org.apache.axis2.description.*;
import org.apache.axis2.engine.AxisConfiguration;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.neethi.Policy;
import org.wso2.carbon.core.Resources;
import org.wso2.carbon.core.persistence.PersistenceFactory;
import org.wso2.carbon.core.persistence.PersistenceUtils;
import org.wso2.carbon.core.persistence.file.ModuleFilePersistenceManager;
import org.wso2.carbon.core.persistence.file.ServiceGroupFilePersistenceManager;
import org.wso2.carbon.registry.core.Registry;
import org.wso2.carbon.utils.ServerException;

import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

public class SecurityServiceAdmin {

    protected AxisConfiguration axisConfig = null;

    private static Log log = LogFactory.getLog(SecurityServiceAdmin.class);

    private PersistenceFactory pf;

    private ServiceGroupFilePersistenceManager sfpm;

    private ModuleFilePersistenceManager mfpm;

    public SecurityServiceAdmin(AxisConfiguration config) throws ServerException {
        this.axisConfig = config;
        try {
            pf = PersistenceFactory.getInstance(config);
            sfpm = pf.getServiceGroupFilePM();
            mfpm = pf.getModuleFilePM();
        } catch (Exception e) {
            log.error("Error creating an PersistenceFactory instance", e);
            throw new ServerException("Error creating an PersistenceFactory instance", e);
        }

        try {
//            this.registry = SecurityServiceHolder.getRegistryService().getConfigSystemRegistry();
        } catch (Exception e) {
            String msg = "Error when retrieving the system config registry";
            log.error(msg);
            throw new ServerException(msg, e);
        }
    }
    public SecurityServiceAdmin(AxisConfiguration config, Registry registry) {
	    this.axisConfig = config;
//	    this.registry = registry;
        try {
            pf = PersistenceFactory.getInstance(config);
            sfpm = pf.getServiceGroupFilePM();
            mfpm = pf.getModuleFilePM();
        } catch (Exception e) {
            log.error("Error creating an PersistenceFactory instance", e);
        }
    }

    /**
     * This method add Policy to service at the Registry. Does not add the
     * policy to Axis2. To all Bindings available
     * 
     * @param axisService
     * @param policy
     * @throws Exception
     */
    public void addSecurityPolicyToAllBindings(AxisService axisService, Policy policy)
	    throws ServerException {


        String serviceGroupId = axisService.getAxisServiceGroup().getServiceGroupName();
	try {
        String policyString = policy.toString();
        ByteArrayInputStream bais = new ByteArrayInputStream(policyString.getBytes());

        if (policy.getId() == null) {
            // Generate an ID
            policy.setId(UUIDGenerator.getUUID());
        }
        boolean transactionStarted = sfpm.isTransactionStarted(serviceGroupId);
        if (!transactionStarted) {
            sfpm.beginTransaction(serviceGroupId);
        }

        OMFactory omFactory = OMAbstractFactory.getOMFactory();
        String serviceXPath = PersistenceUtils.getResourcePath(axisService);

//        String servicePath = RegistryResources.SERVICE_GROUPS
//                + axisService.getAxisServiceGroup().getServiceGroupName()
//                + RegistryResources.SERVICES + axisService.getName();
        String policiesXPath = serviceXPath+"/"+Resources.POLICIES;

        String policyResourcePath = policiesXPath+
                "/"+Resources.POLICY+
                PersistenceUtils.getXPathTextPredicate(Resources.ServiceProperties.POLICY_UUID, policy.getId());
        if (!sfpm.elementExists(serviceGroupId, policyResourcePath)) {
            OMElement policyWrapperElement = omFactory.createOMElement(Resources.POLICY, null);
            policyWrapperElement.addAttribute(Resources.ServiceProperties.POLICY_TYPE,
                    "" + PolicyInclude.BINDING_POLICY, null);

            OMElement idElement = omFactory.createOMElement(Resources.ServiceProperties.POLICY_UUID, null);
            idElement.setText("" + policy.getId());
            policyWrapperElement.addChild(idElement);

            OMElement policyElementToPersist = PersistenceUtils.createPolicyElement(policy);
            policyWrapperElement.addChild(policyElementToPersist);

            if (!sfpm.elementExists(serviceGroupId, policiesXPath)) {
                sfpm.put(serviceGroupId,
                        omFactory.createOMElement(Resources.POLICIES, null), serviceXPath);
//            } else {                              // we already perform a NOT element exists check
//                //you must manually delete the existing policy before adding new one.
//                String pathToPolicy = serviceXPath+"/"+Resources.POLICIES+
//                        "/"+Resources.POLICY+
//                        PersistenceUtils.getXPathTextPredicate(
//                                Resources.ServiceProperties.POLICY_UUID, policy.getId() );
//                if (sfpm.elementExists(serviceGroupId, pathToPolicy)) {
//                    sfpm.delete(serviceGroupId, pathToPolicy);
//                }
            }
            sfpm.put(serviceGroupId, policyWrapperElement, policiesXPath);

//           todo the old impl doesn't add the policyUUID to the binding elements. Is it ok?
//            if (!sfpm.elementExists(serviceGroupId, serviceXPath+
//                    PersistenceUtils.getXPathTextPredicate(
//                            Resources.ServiceProperties.POLICY_UUID, policy.getId() ))) {
//                sfpm.put(serviceGroupId, idElement.cloneOMElement(), serviceXPath); + path to bindings?
//            }
        }

        Map endPointMap = axisService.getEndpoints();
        List<String> lst = new ArrayList<String>();
        for (Object o : endPointMap.entrySet()) {
            Map.Entry entry = (Map.Entry) o;
            AxisEndpoint point = (AxisEndpoint) entry.getValue();
            AxisBinding binding = point.getBinding();
            binding.getPolicySubject().attachPolicy(policy);
            String bindingName = binding.getName().getLocalPart();
            if (lst.contains(bindingName)) {
                continue;
            } else {
                lst.add(bindingName);
            }
            // Add the new policy to the registry
        }
        Iterator<String> ite = lst.iterator();
        while (ite.hasNext()) {
            String bindingName = ite.next();
            String bindingElementPath = serviceXPath+
                    "/"+Resources.ServiceProperties.BINDINGS+
                    "/"+Resources.ServiceProperties.BINDING_XML_TAG+
                    PersistenceUtils.getXPathAttrPredicate(Resources.NAME, bindingName);

            OMElement bindingElement = null;
            if (sfpm.elementExists(serviceGroupId, bindingElementPath)) {
                bindingElement = (OMElement) sfpm.get(serviceGroupId, bindingElementPath);
            } else {
                bindingElement = omFactory.createOMElement(Resources.ServiceProperties.BINDINGS, null);
            }

            OMElement idElement = omFactory.createOMElement(Resources.ServiceProperties.POLICY_UUID, null);
            idElement.setText("" + policy.getId());
            bindingElement.addChild(idElement.cloneOMElement());

            sfpm.put(serviceGroupId, bindingElement, serviceXPath+"/"+Resources.ServiceProperties.BINDINGS);
        }
        if (!transactionStarted) {
            sfpm.commitTransaction(serviceGroupId);
        }
	    // at axis2
	} catch (Exception e) {
	    log.error(e);
        sfpm.rollbackTransaction(serviceGroupId);
	    throw new ServerException("addPoliciesToService");
	}
    }

    public void removeSecurityPolicyFromAllBindings(AxisService axisService, String uuid)
	    throws ServerException {

        String serviceGroupId = axisService.getAxisServiceGroup().getServiceGroupName();
	try {
        String serviceXPath = PersistenceUtils.getResourcePath(axisService);
        String policiesPath = serviceXPath+"/"+Resources.POLICIES;

        // The following logic has been moved to SecurityConfigAdmin
        // Please verify and remove the following commented out block permanently
        /*String policyResourcePath = servicePath + RegistryResources.POLICIES + uuid;
        if (registry.resourceExists(policyResourcePath)) {
            registry.delete(policyResourcePath);
        }*/

        Map endPointMap = axisService.getEndpoints();
        List<String> lst = new ArrayList<String>();
        for (Object o : endPointMap.entrySet()) {
            Map.Entry entry = (Map.Entry) o;
            AxisEndpoint point = (AxisEndpoint) entry.getValue();
            AxisBinding binding = point.getBinding();
            binding.getPolicySubject().detachPolicyComponent(uuid);
            String bindingName = binding.getName().getLocalPart();
            if (lst.contains(bindingName)) {
                continue;
            } else {
                lst.add(bindingName);
            }
            // Add the new policy to the registry
        }
        boolean transactionStarted = sfpm.isTransactionStarted(serviceGroupId);
        if (!transactionStarted) {
            sfpm.beginTransaction(serviceGroupId);
        }
        Iterator<String> ite = lst.iterator();
        while (ite.hasNext()) {
            String bindingName = ite.next();
            String bindingElementPath = serviceXPath+
                    "/"+Resources.ServiceProperties.BINDINGS+
                    "/"+Resources.ServiceProperties.BINDING_XML_TAG+
                    PersistenceUtils.getXPathAttrPredicate(Resources.NAME, bindingName);
            OMNode bindingPolicyUuidOM = sfpm.get(serviceGroupId, bindingElementPath +
                    "/" + Resources.ServiceProperties.POLICY_UUID +
                    PersistenceUtils.getXPathTextPredicate(null, uuid));
            if (bindingPolicyUuidOM != null) {
                bindingPolicyUuidOM.detach();
            }
        }
        if (!transactionStarted) {
            sfpm.commitTransaction(serviceGroupId);
        }
        // at axis2
	} catch (Exception e) {
	    log.error(e);
        sfpm.rollbackTransaction(serviceGroupId);
	    throw new ServerException("addPoliciesToService");
	}
    }

    public void setServiceParameterElement(String serviceName, Parameter parameter)
	    throws AxisFault {
	AxisService axisService = axisConfig.getService(serviceName);

	if (axisService == null) {
	    throw new AxisFault("Invalid service name '" + serviceName + "'");
	}

	Parameter p = axisService.getParameter(parameter.getName());
	if (p != null) {
	    if (!p.isLocked()) {
		axisService.addParameter(parameter);
	    }
	} else {
	    axisService.addParameter(parameter);
	}

    }

}
