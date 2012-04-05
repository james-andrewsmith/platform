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

package org.wso2.carbon.bam.data.publisher.activity.mediation;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * This queue implementation is used to queue all the BAM activities generated by the BAM
 * activity mediators. This also employs a single worker thread, which keeps an eye on the
 * length of the queue. Whenever the length exceeds the specified threshold (default 1),
 * the worker thread will cleanup the queue and handover all the activities accumulated so far
 * to the registered ActivityProcessor. This implementation is thread safe and the worker
 * is programmed to never throw any exceptions and terminate abruptly.
 */
public class ActivityQueue {

    private static final Log log = LogFactory.getLog(ActivityQueue.class);

    private volatile int threshold = 1;
    private boolean shutdown = false;
    private Queue<MessageActivity> activities = new ConcurrentLinkedQueue<MessageActivity>();
    private ExecutorService exec = Executors.newSingleThreadExecutor();
    private ActivityProcessor activityProcessor;

    public ActivityQueue(ActivityProcessor activityProcessor) {
        this.activityProcessor = activityProcessor;
        exec.submit(new ActivityWorker());
    }

    public void cleanup() {
        shutdown = true; // This will stop accepting new activities into the queue
        while (activities.size() > 0) {
            // Wait for the worker to purge already accepted activities from the queue
            if (log.isDebugEnabled()) {
                log.debug("Waiting for the activity queue to become empty");
            }
            delay();
        }
        exec.shutdownNow();
        activityProcessor.destroy();
    }

    public void setThreshold(int threshold) {
        if (log.isDebugEnabled()) {
            log.debug("Initializing the activity queue with the threshold value: " + threshold);
        }
        this.threshold = threshold;
    }

    public void enqueue(MessageActivity activity) {
        if (shutdown) {
            log.warn("BAM activity queue is shutting down... Not accepting the new activity...");
            return;
        }
        activities.offer(activity);
    }

    private void clearActivities(int size) {
        if (log.isDebugEnabled()) {
            log.debug("Clearing " + size + " activities from the activity queue...");
        }

        MessageActivity[] activitySet = new MessageActivity[size];
        for (int i = 0; i < size; i++) {
            activitySet[i] = activities.poll();
        }
        activityProcessor.process(activitySet);
    }

    private void delay() {
        try {
            Thread.sleep(100);
        } catch (InterruptedException ignored) {

        }
    }

    private class ActivityWorker implements Runnable {

        public void run() {
            if (log.isDebugEnabled()) {
                log.info("Initializing the activity processor thread...");
            }

            while (true) {
                try {
                    int size = activities.size();
                    if (size >= threshold || shutdown) {
                        if (log.isDebugEnabled()) {
                            log.debug("Activity threshold (" + threshold + ") exceeds " +
                                    "current activity queue length (" + size + ")");
                        }
                        clearActivities(size);
                    } else {
                        delay();
                        continue;
                    }
                } catch (Throwable t) {
                    // Catch all the errors here - Just don't let the poor worker die!
                    log.error("Unexpected runtime error in the activity processor", t);
                }
            }
        }
    }

}