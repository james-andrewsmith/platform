/*
 *  Copyright (c) 2005-2010, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */
package org.wso2.carbon.dataservices.core.internal;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.osgi.framework.BundleContext;
import org.osgi.service.component.ComponentContext;
import org.wso2.carbon.CarbonConstants;
import org.wso2.carbon.core.multitenancy.SuperTenantCarbonContext;
import org.wso2.carbon.dataservices.core.listeners.EventBrokerServiceListener;
import org.wso2.carbon.datasource.DataSourceInformationRepositoryService;
import org.wso2.carbon.event.core.EventBroker;
import org.wso2.carbon.registry.core.service.RegistryService;
import org.wso2.carbon.user.core.service.RealmService;
import org.wso2.carbon.utils.Axis2ConfigurationContextObserver;
import org.wso2.carbon.utils.multitenancy.CarbonContextHolder;

import java.util.ArrayList;
import java.util.List;

/**
 * @scr.component name="dataservices.component" immediate="true"
 * @scr.reference name="registry.service" interface="org.wso2.carbon.registry.core.service.RegistryService"
 * cardinality="1..1" policy="dynamic"  bind="setRegistryService" unbind="unsetRegistryService"
 * @scr.reference name="user.realmservice.default" interface="org.wso2.carbon.user.core.service.RealmService"
 * cardinality="1..1" policy="dynamic" bind="setRealmService" unbind="unsetRealmService"
 * @scr.reference name="org.wso2.carbon.datasource.DataSourceInformationRepositoryService" interface="org.wso2.carbon.datasource.DataSourceInformationRepositoryService"
 * cardinality="1..1" policy="dynamic" bind="setCarbonDataSourceService" unbind="unsetCarbonDataSourceService"
 * @scr.reference name="eventbrokerbuilder.component" interface="org.wso2.carbon.event.core.EventBroker"
 * cardinality="0..1" policy="dynamic" bind="setEventBroker" unbind="unsetEventBroker"
 */
public class DataServicesDSComponent {

    private static Log log = LogFactory.getLog(DataServicesDSComponent.class);

    private static RegistryService registryService = null;

    private static RealmService realmService = null;

    private static DataSourceInformationRepositoryService dataSourceService;

    private static EventBroker eventBroker;

    private static List<EventBrokerServiceListener> eventBrokerServiceListeners =
            new ArrayList<EventBrokerServiceListener>();

    private static Object dsComponentLock = new Object(); /* class level lock for controlling synchronized access to static variables */

    public DataServicesDSComponent() {
    }

    protected void activate(ComponentContext ctxt) {
        try {
            BundleContext bundleContext = ctxt.getBundleContext();
            bundleContext.registerService(Axis2ConfigurationContextObserver.class.getName(),
                    new DSAxis2ConfigurationContextObserver(), null);
            bundleContext.registerService(DSDummyService.class.getName(), new DSDummyService(),
                    null);
            log.debug("Data Services bundle is activated ");
        } catch (Throwable e) {
            log.error(e.getMessage(), e);
            /* don't throw exception */
        }
    }

    protected void deactivate(ComponentContext ctxt) {
        log.debug("Data Services bundle is deactivated ");
    }

    protected void setRegistryService(RegistryService registryService) {
        if (log.isDebugEnabled()) {
            log.debug("Setting the Registry Service");
        }
        DataServicesDSComponent.registryService = registryService;
    }

    protected void unsetRegistryService(RegistryService registryService) {
        if (log.isDebugEnabled()) {
            log.debug("Unsetting the Registry Service");
        }
        DataServicesDSComponent.registryService = null;
    }

    protected void setRealmService(RealmService realmService) {
        if (log.isDebugEnabled()) {
            log.debug("Setting the Realm Service");
        }
        DataServicesDSComponent.realmService = realmService;
    }

    protected void unsetRealmService(RealmService realmService) {
        if (log.isDebugEnabled()) {
            log.debug("Unsetting the Realm Service");
        }
        DataServicesDSComponent.realmService = null;
    }

    public static RegistryService getRegistryService() {
        return registryService;
    }

    public static RealmService getRealmService() {
        return realmService;
    }

    protected void setCarbonDataSourceService(
            DataSourceInformationRepositoryService dataSourceService) {
        if (log.isDebugEnabled()) {
            log.debug("Setting the Carbon Data Sources Service");
        }
        DataServicesDSComponent.dataSourceService = dataSourceService;
    }

    protected void unsetCarbonDataSourceService(
            DataSourceInformationRepositoryService dataSourceService) {
        if (log.isDebugEnabled()) {
            log.debug("Unsetting the Carbon Data Sources Service");
        }
        DataServicesDSComponent.dataSourceService = null;
    }

    public static DataSourceInformationRepositoryService getCarbonDataSourceService() {
        return dataSourceService;
    }

    protected void setEventBroker(EventBroker eventBroker) {
        synchronized (dsComponentLock) {
            if (log.isDebugEnabled()) {
                log.debug("Setting the Event Broker Service");
            }
            DataServicesDSComponent.eventBroker = eventBroker;
            /* event functionality depends on realm service */
            if (DataServicesDSComponent.realmService != null) {
                this.doEventRealmInitiliased();
            }
        }
    }

    private void notifyEventServiceListeners() {
        for (EventBrokerServiceListener listener : eventBrokerServiceListeners) {
            SuperTenantCarbonContext.startTenantFlow();
            SuperTenantCarbonContext.getCurrentContext().setTenantId(listener.getTenantId());
            listener.setEventBroker(eventBroker);
            SuperTenantCarbonContext.endTenantFlow();
        }
        eventBrokerServiceListeners.clear();
    }

    private void doEventRealmInitiliased() {
         RealmService realmService = DataServicesDSComponent.getRealmService();
        try {
            SuperTenantCarbonContext.getCurrentContext().setUserRealm(
                    realmService.getBootstrapRealm());
            SuperTenantCarbonContext.getCurrentContext().setUsername(
                    CarbonConstants.REGISTRY_SYSTEM_USERNAME);
        } catch (Exception e) {
            log.error(e.getMessage(), e);
        }
        this.notifyEventServiceListeners();
    }

    protected void unsetEventBroker(EventBroker eventBroker) {
        synchronized (dsComponentLock) {
            if (log.isDebugEnabled()) {
                log.debug("Unsetting the Event Broker Service");
            }
            DataServicesDSComponent.eventBroker = null;
        }
    }

    public static EventBroker getEventBroker() {
        return eventBroker;
    }

    public static void registerEventBrokerServiceListener(
            EventBrokerServiceListener listener) {
        synchronized (dsComponentLock) {
            EventBroker eventBroker = getEventBroker();
            if (eventBroker == null) {
                eventBrokerServiceListeners.add(listener);
            } else {
                listener.setEventBroker(eventBroker);
            }
        }
    }

    public static String getUsername() {
        return CarbonContextHolder.getCurrentCarbonContextHolder().getUsername();
    }

}