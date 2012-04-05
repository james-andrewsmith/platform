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
package org.wso2.carbon.apimgt.usage.publisher.dto;

import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.Map;

public class RequestPublisherDTO extends PublisherDTO {

    private String request = "1";

    private String requestTime;

    public void setRequestTime(String requestTime){
        this.requestTime = requestTime;
    }

    public String getRequestTime(){
        return requestTime;
    }

    public Map<String, ByteBuffer> createEventDataMap() {
        Map<String, ByteBuffer> eventMap = new HashMap<String, ByteBuffer>();
        eventMap.put("consumerKey", ByteBuffer.wrap(getConsumerKey().getBytes()));
        eventMap.put("context", ByteBuffer.wrap(getContext().getBytes()));
        eventMap.put("api", ByteBuffer.wrap(getApi().getBytes()));
        eventMap.put("resource", ByteBuffer.wrap(getResource().getBytes()));
        eventMap.put("method", ByteBuffer.wrap(getMethod().getBytes()));
        eventMap.put("version", ByteBuffer.wrap(getVersion().getBytes()));
        eventMap.put("request", ByteBuffer.wrap(request.getBytes()));
        eventMap.put("requestTime", ByteBuffer.wrap(getRequestTime().getBytes()));
        return eventMap;
    }
}
