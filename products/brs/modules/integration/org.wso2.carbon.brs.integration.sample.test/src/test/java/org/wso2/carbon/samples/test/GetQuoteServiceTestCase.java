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
package org.wso2.carbon.samples.test;

import org.apache.axis2.AxisFault;
import org.wso2.carbon.samples.test.quoteService.customerDetail.Customer;
import org.wso2.carbon.samples.test.quoteService.customerDetail.PlaceCustomerDetail;
import org.wso2.carbon.samples.test.quoteService.customerDetail.Quotation;
import org.wso2.carbon.samples.test.quoteService.stub.GetQuoteServiceStub;
import org.wso2.carbon.integration.framework.TestServerManager;
import org.wso2.carbon.utils.FileManipulator;
import org.testng.annotations.Test;

import java.rmi.RemoteException;

import static org.testng.Assert.assertNotNull;

public class GetQuoteServiceTestCase {

    @Test(groups = {"wso2.brs"})
    public void testGetQuote() {
        try {
            GetQuoteServiceStub getQuoteServiceStub = new GetQuoteServiceStub("http://localhost:9763/services/GetQuoteService");

            PlaceCustomerDetail placeCustomerDetail = new PlaceCustomerDetail();
            Customer customer = new Customer();
            customer.setStatus("gold");
            Customer[] customers = new Customer[1];
            customers[0] = customer;
            placeCustomerDetail.setCustomerDetail(customers);

            Quotation[] quotations = getQuoteServiceStub.getQuote(customers);
            int result = quotations[0].getPrice();
            assertNotNull(result, "Result cannot be null");

        } catch (AxisFault axisFault) {
            axisFault.printStackTrace();
            assertNotNull(null);
        } catch (RemoteException e) {
            e.printStackTrace();
            assertNotNull(null);
        }
    }
}
