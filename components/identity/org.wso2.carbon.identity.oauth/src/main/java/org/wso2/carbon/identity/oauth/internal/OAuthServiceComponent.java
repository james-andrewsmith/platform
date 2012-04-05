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

package org.wso2.carbon.identity.oauth.internal;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.osgi.service.component.ComponentContext;
import org.wso2.carbon.registry.core.service.RegistryService;
import org.wso2.carbon.user.core.service.RealmService;

/**
 * @scr.component name="identity.oauth.component" immediate="true"
 * @scr.reference name="registry.service"
 *                interface="org.wso2.carbon.registry.core.service.RegistryService"
 *                cardinality="1..1" policy="dynamic" bind="setRegistryService"
 *                unbind="unsetRegistryService"
 * @scr.reference name="user.realmservice.default"
 *                interface="org.wso2.carbon.user.core.service.RealmService" cardinality="1..1"
 *                policy="dynamic" bind="setRealmService" unbind="unsetRealmService"
 */
public class OAuthServiceComponent {
	private static Log log = LogFactory.getLog(OAuthServiceComponent.class);
	private static RegistryService registryService;
	private static RealmService realmService;

	/**
	 * 
	 * @return
	 */
	public static RegistryService getRegistryService() {
		return registryService;
	}

	/**
	 * 
	 * @return
	 */
	public static RealmService getRealmService() {
		return realmService;
	}

	/**
	 * 
	 * @param context
	 */
	protected void activate(ComponentContext context) {
		if (log.isDebugEnabled()) {
			log.info("Identity OAuth bundle is activated");
		}
	}

	/**
	 * 
	 * @param context
	 */
	protected void deactivate(ComponentContext context) {
		if (log.isDebugEnabled()) {
			log.info("Identity OAuth bundle is deactivated");
		}
	}

	/**
	 * 
	 * @param registryService
	 */
	protected void setRegistryService(RegistryService registryService) {
		if (log.isDebugEnabled()) {
			log.info("RegistryService set in Identity OAuth bundle");
		}
		OAuthServiceComponent.registryService = registryService;
	}

	/**
	 * 
	 * @param registryService
	 */
	protected void unsetRegistryService(RegistryService registryService) {
		if (log.isDebugEnabled()) {
			log.info("RegistryService unset in Identity OAuth bundle");
		}
		registryService = null;
	}

	/**
	 * 
	 * @param realmService
	 */
	protected void setRealmService(RealmService realmService) {
		if (log.isDebugEnabled()) {
			log.info("Setting the Realm Service");
		}
		OAuthServiceComponent.realmService = realmService;
	}

	/**
	 * 
	 * @param realmService
	 */
	protected void unsetRealmService(RealmService realmService) {
		if (log.isDebugEnabled()) {
			log.info("Unsetting the Realm Service");
		}
		OAuthServiceComponent.realmService = null;
	}

}