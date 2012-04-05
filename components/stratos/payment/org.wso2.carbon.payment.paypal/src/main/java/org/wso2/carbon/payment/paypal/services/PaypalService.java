/**
 *  Copyright (c) 2009, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
package org.wso2.carbon.payment.paypal.services;

import com.paypal.sdk.exceptions.PayPalException;
import com.paypal.soap.api.*;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.wso2.carbon.business.messaging.paypal.integration.PaypalSOAPProxy;
import org.wso2.carbon.core.AbstractAdmin;
import org.wso2.carbon.payment.paypal.dto.ECDetailResponse;
import org.wso2.carbon.payment.paypal.dto.ECResponse;
import org.wso2.carbon.payment.paypal.dto.TransactionResponse;
import org.wso2.carbon.payment.paypal.util.PaymentConstants;
import org.wso2.carbon.payment.paypal.util.ResponsePopulator;

/**
 * The <code>PaypalService</code> class provides the methods required to access Paypal web service
 */

public class PaypalService extends AbstractAdmin{

    //NOTE: EC stands for ExpressCheckout
    //PayPal soap proxy object
    public static PaypalSOAPProxy proxy;

    private static Log log = LogFactory.getLog(PaypalService.class);

    private ResponsePopulator populator = new ResponsePopulator();

    /**
     * This method initiates an express checkout
     * @param amount amount to be paid
     * @param successReturnUrl url of the page to be redirected from paypal site
     * after a successful scenario
     * @param cancelReturnUrl url of the page to be redirected if the user cancels the transaction
     * @return returns the response object
     */
    public ECResponse initExpressCheckout(String amount, String successReturnUrl,
                                      String cancelReturnUrl) throws PayPalException{

        SetExpressCheckoutRequestType ecRequest = new SetExpressCheckoutRequestType();

        //Adding details to the request
        SetExpressCheckoutRequestDetailsType details = new SetExpressCheckoutRequestDetailsType();
        details.setReturnURL(successReturnUrl);
        details.setCancelURL(cancelReturnUrl);
        details.setNoShipping("1");

        BasicAmountType orderTotal = new BasicAmountType();
        orderTotal.set_value(amount);
        orderTotal.setCurrencyID(CurrencyCodeType.USD);
        details.setOrderTotal(orderTotal);
        details.setPaymentAction(PaymentActionCodeType.Sale);

        ecRequest.setSetExpressCheckoutRequestDetails(details);

        SetExpressCheckoutResponseType ecResponse =
               (SetExpressCheckoutResponseType) proxy.call(PaymentConstants.SET_EXPRESSCHECKOUT_OPERATION, ecRequest);

        return populator.populateSetECResponse(ecResponse);
    }

    /**
     * Get the details of an express checkout
     * @param token this is the token received at setting the express checkout
     * @return returns the response object
     */
    public ECDetailResponse getExpressCheckoutDetails(String token) throws PayPalException {
        GetExpressCheckoutDetailsRequestType detailRequest = new GetExpressCheckoutDetailsRequestType();
        detailRequest.setToken(token);

        GetExpressCheckoutDetailsResponseType detailResponse =
                (GetExpressCheckoutDetailsResponseType) proxy.call(PaymentConstants.GET_EXPRESSCHECKOUT_OPERATION, detailRequest);

        return populator.populateECDetailResponse(detailResponse);
    }

    /**
     *
     * @param token token received at beginning the transaction
     * @param payerId
     * @param amount amount to be paid (this has to be taken after payer has confirmed in the paypal site)
     * @param paymentAction
     * @return returns the response object
     */
    public TransactionResponse doExpressCheckout(String token, String payerId, String amount,
                                    String paymentAction) throws PayPalException {
        DoExpressCheckoutPaymentRequestType doECRequest = new DoExpressCheckoutPaymentRequestType();

        DoExpressCheckoutPaymentRequestDetailsType paymentRequestDetails =
                new DoExpressCheckoutPaymentRequestDetailsType();
        paymentRequestDetails.setToken(token);
        paymentRequestDetails.setPayerID(payerId);

        log.debug("PayerId: " + payerId);
        //I am setting payment action as sale. It seems like the payment action
        //passed to this method is not necessary
        //TODO:set the payment action based on the string passed to the method
        paymentRequestDetails.setPaymentAction(PaymentActionCodeType.Sale);

        PaymentDetailsType paymentDetails = new PaymentDetailsType();
        BasicAmountType orderTotal = new BasicAmountType();
        orderTotal.set_value(amount);
        orderTotal.setCurrencyID(CurrencyCodeType.USD);
        paymentDetails.setOrderTotal(orderTotal);

        paymentRequestDetails.setPaymentDetails(paymentDetails);

        doECRequest.setDoExpressCheckoutPaymentRequestDetails(paymentRequestDetails);

        //Calling the caller service and returning the response
        DoExpressCheckoutPaymentResponseType doECResponse =
                (DoExpressCheckoutPaymentResponseType) proxy.call(PaymentConstants.DO_EXPRESSCHECKOUT_OPERATION, doECRequest);
        log.debug("DoEC Ack:" + doECResponse.getAck().toString());

        //this is a retry to do the payment. There is no reason mentioned for the error 10001
        if(PaymentConstants.RESPONSE_FAILURE.equals(doECResponse.getAck().toString()) &&
                "10001".equals(doECResponse.getErrors(0).getErrorCode().toString())){
            log.debug("Errors: " + doECResponse.getErrors().length);
            doECResponse = (DoExpressCheckoutPaymentResponseType)
                            proxy.call(PaymentConstants.DO_EXPRESSCHECKOUT_OPERATION, doECRequest);
        }

        //log.debug("Error code: " + doECResponse.getErrors(0).getErrorCode().toString());
        //log.debug("Long message: " + doECResponse.getErrors(0).getLongMessage());
        if(PaymentConstants.RESPONSE_SUCCESS.equals(doECResponse.getAck().toString()) &&
                doECResponse.getDoExpressCheckoutPaymentResponseDetails()!=null){
            log.debug("DoEC Token: " + doECResponse.getDoExpressCheckoutPaymentResponseDetails().getToken().toString());
        }

        TransactionResponse tr = populator.populateDoECResponse(doECResponse);
        
        log.debug("Returning transaction response");
        //return populator.populateDoECResponse(doECResponse);
        return tr;
    }
}
