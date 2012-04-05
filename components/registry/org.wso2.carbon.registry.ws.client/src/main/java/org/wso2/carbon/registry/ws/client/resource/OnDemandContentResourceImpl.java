package org.wso2.carbon.registry.ws.client.resource;

import org.wso2.carbon.registry.core.ResourceImpl;
import org.wso2.carbon.registry.core.exceptions.RegistryException;
import org.wso2.carbon.registry.ws.client.registry.WSRegistryServiceClient;

public class OnDemandContentResourceImpl extends ResourceImpl {
	
	private String pathWithVersion;

	public String getPathWithVersion() {
		return pathWithVersion;
	}

	public void setPathWithVersion(String pathWithVersion) {
		this.pathWithVersion = pathWithVersion;
	}

	public OnDemandContentResourceImpl(WSRegistryServiceClient client) {
		this.client = client;
	}

	public WSRegistryServiceClient getClient() {
		return client;
	}

	public void setClient(WSRegistryServiceClient client) {
		this.client = client;
	}

	private WSRegistryServiceClient client;

	@Override
	public Object getContent() throws RegistryException {
		try {
			if (content == null) { // fetch data only if it hasn't been fetched previously
				content = getClient().getContent(getPathWithVersion());
			}
			return content;
		} catch (Exception e) {
			throw new RegistryException("Failed to get resource content", e);
		}
	}

}
