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

package org.wso2.carbon.identity.entitlement.policy;

import org.wso2.carbon.CarbonConstants;
import org.wso2.carbon.context.CarbonContext;
import org.wso2.carbon.identity.entitlement.dto.AttributeValueTreeNodeDTO;
import org.wso2.carbon.identity.entitlement.internal.EntitlementServiceComponent;
import org.wso2.carbon.registry.api.Resource;
import org.wso2.carbon.registry.core.Collection;
import org.wso2.carbon.registry.core.Registry;
import org.wso2.carbon.registry.core.exceptions.RegistryException;
import org.wso2.carbon.user.api.UserStoreManager;

import java.util.HashSet;
import java.util.Properties;
import java.util.Set;

/**
 * this is default implementation of the policy meta data finder module which finds the resource in the
 * under-line registry
 */
public class CarbonPolicyMetaDataFinder extends AbstractPolicyMetaDataFinder {

    private String MODULE_NAME =  "Carbon Attribute Finder Module";

    private Registry registry;

    private String[] defaultActions = new String[]{"read", "write", "delete", "edit"};

    @Override
    public void init(Properties properties) throws Exception {

    }

    @Override
    public String getModuleName() {
        return  MODULE_NAME;
    }

    @Override
    public AttributeValueTreeNodeDTO getAttributeValueData(String attributeType) throws Exception {

        registry = EntitlementServiceComponent.getRegistryService().getSystemRegistry(CarbonContext.
                getCurrentContext().getTenantId());        
        if(getResourceAttributeTypeId().equals(attributeType)){
            AttributeValueTreeNodeDTO  nodeDTO = new AttributeValueTreeNodeDTO("/");
            getChildResources(nodeDTO, "_system");
            return nodeDTO;
        } else if(getActionAttributeTypeId().equals(attributeType)){
            AttributeValueTreeNodeDTO nodeDTO = new AttributeValueTreeNodeDTO("");
            for (String action : defaultActions){
                AttributeValueTreeNodeDTO childNode = new AttributeValueTreeNodeDTO(action);
                nodeDTO.addChildNode(childNode);
            }
            return nodeDTO;
        } else if(getSubjectAttributeTypeId().equals(attributeType)){
            AttributeValueTreeNodeDTO nodeDTO = new AttributeValueTreeNodeDTO("");
            int tenantId =  CarbonContext.getCurrentContext().getTenantId();
            UserStoreManager userStoreManager = EntitlementServiceComponent.getRealmservice().
                    getTenantUserRealm(tenantId).getUserStoreManager();
            for(String role : userStoreManager.getRoleNames()){
                if(CarbonConstants.REGISTRY_ANONNYMOUS_ROLE_NAME.equals(role)){
                    continue;
                }
                AttributeValueTreeNodeDTO childNode = new AttributeValueTreeNodeDTO(role);
                nodeDTO.addChildNode(childNode);
            }
            return nodeDTO;
        }

        return null;
    }

    @Override
    public boolean isSubjectAttributeSupported() {
        return true;
    }

    @Override
    public boolean isResourceAttributeSupported() {
        return true; 
    }

    @Override
    public boolean isActionAttributeSupported() {
        return true;
    }

    @Override
    public boolean isEnvironmentAttributeSupported() {
        return false;
    }

    /**
     * This helps to find resources un a recursive manner
     * @param node attribute value node
     * @param parentResource  parent resource Name
     * @return child resource set
     * @throws org.wso2.carbon.registry.core.exceptions.RegistryException throws
     */
    private AttributeValueTreeNodeDTO getChildResources(AttributeValueTreeNodeDTO node, String parentResource)
            throws RegistryException {

        if(registry.resourceExists(parentResource)){
            String[] resourcePath = parentResource.split("/");
            AttributeValueTreeNodeDTO childNode = new AttributeValueTreeNodeDTO(resourcePath[resourcePath.length-1]);
            node.addChildNode(childNode);
            Resource root = registry.get(parentResource);
            if(root instanceof Collection){
                Collection collection = (Collection) root;
                String[] resources = collection.getChildren();
                for(String resource : resources){
                    getChildResources(childNode, resource);
                }
            }
        }

        return node;
    }


    @Override
    public boolean isHierarchicalTree() {
        return true;
    }

    @Override
    public Set<String> getSupportedAttributeIds(String attributeType) throws Exception {
        Set<String> values = new HashSet<String>();        
        if(getSubjectAttributeTypeId().equals(attributeType)){
            values.add("http://wso2.org/claims/role");
        }
        return values;
    }
}
