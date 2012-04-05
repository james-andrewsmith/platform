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
package samples.userguide;

import org.apache.axiom.om.OMElement;
import org.apache.axis2.client.async.AxisCallback;

/**
 * 
 */
public class StockQuoteCallback implements AxisCallback {

    public void onMessage(org.apache.axis2.context.MessageContext messageContext) {
        System.out.println("Response received to the callback");
        OMElement result
                = messageContext.getEnvelope().getBody().getFirstElement();
        // Detach the result to make sure that the element we return to the sample client
        // is completely built
        result.detach();
        StockQuoteClient.InnerStruct.RESULT = result;
    }

    public void onFault(org.apache.axis2.context.MessageContext messageContext) {
        System.out.println("Fault received to the callback : " + messageContext.getEnvelope().getBody().getFault());
    }

    public void onError(Exception e) {
        System.out.println("Error inside callback : " + e);
    }

    public void onComplete() {
        StockQuoteClient.InnerStruct.COMPLETED = true;
    }
}
