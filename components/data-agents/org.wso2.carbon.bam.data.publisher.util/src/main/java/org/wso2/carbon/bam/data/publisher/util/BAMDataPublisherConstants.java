/*
 *  Licensed to the Apache Software Foundation (ASF) under one
 *  or more contributor license agreements.  See the NOTICE file
 *  distributed with this work for additional information
 *  regarding copyright ownership.  The ASF licenses this file
 *  to you under the Apache License, Version 2.0 (the
 *  "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *   * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 */
package org.wso2.carbon.bam.data.publisher.util;

public class BAMDataPublisherConstants {

    public static final String AGENT_CONFIG = "agent.xml";
    public static final String PUBLISHER_CONFIG_THREAD_POOL_ELEMENT = "ThreadPool";

    public static final String PUBLISHER_CONFIG_TASK_QUEUE_SIZE_ELEMENT = "TaskQueue";
    public static final String PUBLISHER_CONFIG_CORE_POOL_SIZE_ELEMENT = "CorePool";
    public static final String PUBLISHER_CONFIG_MAX_POOL_SIZE_ELEMENT = "MaxPool";

    public static final String PUBLISHER_CONFIG_EVENT_QUEUE_SIZE_ELEMENT = "EventQueue";

    public static final String PUBLISHER_CONFIG_CONNECTION_POOL_ELEMENT = "ConnectionPool";
    public static final String PUBLISHER_CONFIG_MAX_IDLE_SIZE_ELEMENT = "MaxIdle";
    public static final String PUBLISHER_CONFIG_TIME_GAP_EVICTION_RUN_ELEMENT = "TimeBetweenEvictionRunsMillis";
    public static final String PUBLISHER_CONFIG_MIN_IDLE_TIME_ELEMENT = "MinEvictableIdleTimeMillis";


    public static final String STATISTICS_REQUEST_RECIEVED_TIME = "wso2statistics.request.received.time";


    public static final String HTTP_HEADER_USER_AGENT = "user-agent";
    public static final String HTTP_HEADER_HOST = "host";
    public static final String HTTP_HEADER_REFERER = "referer";

    public static final String REMOTE_ADDRESS = "remote_address";
    public static final String USER_AGENT = "user_agent";
    public static final String HOST = "host";
    public static final String CONTENT_TYPE = "content_type";
    public static final String REFERER = "referer";
    public static final String REQUEST_URL = "request_url";

    public static final String SERVICE_NAME = "service_name";
    public static final String OPERATION_NAME = "operation_name";
    public static final String TIMESTAMP = "timestamp";

    public static final String MSG_ACTIVITY_ID = "bam_activity_id";
    public static final String MSG_ID = "message_id";
    public static final String MSG_BODY = "message_body";
    public static final String IN_MSG_ID = "in_message_id";
    public static final String IN_MSG_BODY = "in_message_body";
    public static final String OUT_MSG_ID = "out_message_id";
    public static final String OUT_MSG_BODY = "out_message_body";
    public static final String MSG_DIRECTION = "message_direction";


    public static final String BAM_URL = "BAMUrl";
    public static final String BAM_USER_NAME = "BAMUserName";
    public static final String BAM_PASSWORD = "BAMPassword";
    public static final String ENABLE_HTTP_TRANSPORT = "EnableHttp";
    public static final String ENABLE_SOCKET_TRANSPORT = "EnableSocket";
    public static final String BAM_SOCKET_PORT = "port";


    public static final String SOAP_ENVELOP_NAMESPACE_URI = "soap_envelop_namespace";

    public static final String PUBLISH_DATA = "event_data";
    public static final String HOSTNAME_AND_PORT_SEPARATOR = ":";
    public static final String PREFIX_FOR_REGISTRY_HIDDEN_PROPERTIES = "registry.";
}
