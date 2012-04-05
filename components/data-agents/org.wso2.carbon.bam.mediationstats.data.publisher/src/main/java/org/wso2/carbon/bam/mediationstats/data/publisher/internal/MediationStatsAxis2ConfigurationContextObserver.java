/*
 * Copyright 2004,2005 The Apache Software Foundation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.wso2.carbon.bam.mediationstats.data.publisher.internal;


import org.apache.axis2.context.ConfigurationContext;
import org.apache.axis2.engine.AxisConfiguration;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.wso2.carbon.bam.mediationstats.data.publisher.conf.MediationStatConfig;
import org.wso2.carbon.bam.mediationstats.data.publisher.conf.RegistryPersistenceManager;
import org.wso2.carbon.bam.mediationstats.data.publisher.util.TenantMediationStatConfigData;
import org.wso2.carbon.core.multitenancy.SuperTenantCarbonContext;
import org.wso2.carbon.utils.AbstractAxis2ConfigurationContextObserver;

import java.util.Map;

public class MediationStatsAxis2ConfigurationContextObserver
        extends AbstractAxis2ConfigurationContextObserver {

    private static final Log log = LogFactory.getLog(MediationStatsAxis2ConfigurationContextObserver.class);

    @Override
    public void createdConfigurationContext(ConfigurationContext configContext) {
        AxisConfiguration axisConfiguration = configContext.getAxisConfiguration();
        setMediationStatConfigDataSpecificForTenant(axisConfiguration);
    }


    private void setMediationStatConfigDataSpecificForTenant(AxisConfiguration axisConfiguration) {
        int tenantID = SuperTenantCarbonContext.getCurrentContext(axisConfiguration).getTenantId();
        Map<Integer, MediationStatConfig> mediationStatConfigMap = TenantMediationStatConfigData.
                getTenantSpecificEventingConfigData();
        RegistryPersistenceManager persistenceManager = new RegistryPersistenceManager();
        MediationStatConfig eventingConfigData = persistenceManager.getEventingConfigData();
        mediationStatConfigMap.put(tenantID, eventingConfigData);
    }
}
