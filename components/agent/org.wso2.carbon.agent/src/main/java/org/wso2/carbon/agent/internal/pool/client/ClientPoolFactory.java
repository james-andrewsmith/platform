/**
 *
 * Copyright (c) 2005-2010, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


package org.wso2.carbon.agent.internal.pool.client;


import org.apache.commons.pool.BaseKeyedPoolableObjectFactory;
import org.apache.thrift.protocol.TBinaryProtocol;
import org.apache.thrift.protocol.TProtocol;
import org.apache.thrift.transport.TSocket;
import org.apache.thrift.transport.TTransport;
import org.wso2.carbon.agent.commons.thrift.service.ThriftEventReceiverService;
import org.wso2.carbon.agent.internal.utils.AgentConstants;

public class ClientPoolFactory extends BaseKeyedPoolableObjectFactory {

    @Override
    public ThriftEventReceiverService.Client makeObject(Object key) throws Exception {
        String[] hostNameAndPort = key.toString().split(AgentConstants.HOSTNAME_AND_PORT_SEPARATOR);

        TTransport receiverTransport = new TSocket(hostNameAndPort[0],
                                                   Integer.parseInt(hostNameAndPort[1]));
        TProtocol protocol = new TBinaryProtocol(receiverTransport);
        ThriftEventReceiverService.Client client = new ThriftEventReceiverService.Client(protocol);
        receiverTransport.open();

        return client;
    }

    @Override
    public boolean validateObject(Object key, Object obj) {
        ThriftEventReceiverService.Client client= (ThriftEventReceiverService.Client)obj;
        return client.getOutputProtocol().getTransport().isOpen();
    }


}
