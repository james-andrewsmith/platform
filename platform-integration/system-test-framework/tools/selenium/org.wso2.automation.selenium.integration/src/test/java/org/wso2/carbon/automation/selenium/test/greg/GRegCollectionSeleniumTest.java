/*
*Copyright (c) 2005-2010, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
*WSO2 Inc. licenses this file to you under the Apache License,
*Version 2.0 (the "License"); you may not use this file except
*in compliance with the License.
*You may obtain a copy of the License at
*
*http://www.apache.org/licenses/LICENSE-2.0
*
*Unless required by applicable law or agreed to in writing,
*software distributed under the License is distributed on an
*"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
*KIND, either express or implied.  See the License for the
*specific language governing permissions and limitations
*under the License.
*/
package org.wso2.carbon.automation.selenium.test.greg;

import com.thoughtworks.selenium.Selenium;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverBackedSelenium;
import org.openqa.selenium.WebDriverException;
import org.wso2.platform.test.core.BrowserManager;
import org.wso2.platform.test.core.utils.UserInfo;
import org.wso2.platform.test.core.utils.UserListCsvReader;
import org.wso2.platform.test.core.utils.gregutils.GregUserIDEvaluator;
import org.wso2.platform.test.core.utils.seleniumutils.GRegBackEndURLEvaluator;
import org.wso2.platform.test.core.utils.seleniumutils.GregUserLogin;
import org.wso2.platform.test.core.utils.seleniumutils.GregUserLogout;
import org.testng.annotations.*;
import org.wso2.platform.test.core.utils.seleniumutils.SeleniumScreenCapture;

import static org.testng.Assert.*;


import java.io.IOException;
import java.net.MalformedURLException;


public class GRegCollectionSeleniumTest {
    private static final Log log = LogFactory.getLog(GRegCollectionSeleniumTest.class);
    private static Selenium selenium;
    private static WebDriver driver;
    String username;
    String password;

    @BeforeClass(alwaysRun = true)
    public void init() throws MalformedURLException {
        int userId = new GregUserIDEvaluator().getTenantID();
        String baseUrl = new GRegBackEndURLEvaluator().getBackEndURL();
        log.info("baseURL is " + baseUrl);
        driver = BrowserManager.getWebDriver();
        selenium = new WebDriverBackedSelenium(driver, baseUrl);
        driver.get(baseUrl);
        UserInfo tenantDetails = UserListCsvReader.
                getUserInfo(userId);
        username = tenantDetails.getUserName();
        password = tenantDetails.getPassword();
    }

    @Test(groups = {"wso2.greg"}, description = "add a collection tree ", priority = 1)
    private void testAddCollectionTree() throws Exception {
        String collectionPath = "/selenium_root/collection_root/c1/c2";
        try {
            userLogin();
            gotoDetailViewTab();

            addCollection(collectionPath);      //Create Collection  1
            Thread.sleep(3000L);
            assertEquals(collectionPath, selenium.getValue("//input"),
                         "New Created Collection does not Exists :");

            new GregUserLogout().userLogout(driver);
            log.info("********GRegCollectionSeleniumTest testAddCollection() - Passed ***********");
        } catch (WebDriverException e) {
            log.info("Failed to add collection to selenium_root: - WebDriver Exception :" +
                     e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_testAddCollection");
            new GregUserLogout().userLogout(driver);
            Thread.sleep(3000L);
            throw new WebDriverException("Failed to add collection to selenium_root:" +
                                         e.getMessage());
        } catch (Exception e) {
            log.info("Failed to add collection to selenium_root:- Fail :" + e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_testAddCollection");
            new GregUserLogout().userLogout(driver);
            Thread.sleep(3000L);
            throw new Exception("Failed to add collection to selenium_root:" + e.getMessage());
        }
    }

    @Test(groups = {"wso2.greg"}, description = "add a comment to collection ", priority = 2)
    private void testAddComment() throws Exception {
        String collectionPath = "/selenium_root/collection_root/comment/a1";
        String comment = "Collection Comment1";

        try {
            userLogin();
            gotoDetailViewTab();

            addCollection(collectionPath);                   //Create Collection  1
            Thread.sleep(3000L);
            assertEquals(collectionPath, selenium.getValue("//input"),
                         "New Created Collection does not Exists :");

            //Add Comment
            driver.findElement(By.id("commentsIconMinimized")).click();
            Thread.sleep(2000L);
            driver.findElement(By.linkText("Add Comment")).click();
            Thread.sleep(3000L);
            assertTrue(selenium.isTextPresent("Add New Comment"),
                       "Add comment window pop -up failed :");
            assertEquals("Add", selenium.getValue("//div[12]/div/div[3]/div[3]/form/table/tbody/tr[2]/td/input"),
                         "Add comment window  pop -up failed :");
            assertEquals("Cancel", selenium.getValue("//div[12]/div/div[3]/div[3]/form/table/tbody/tr[2]/td/input[2]"),
                         "Add comment window  pop -up failed :");
            driver.findElement(By.id("comment")).sendKeys(comment);
            driver.findElement(By.xpath("//div[12]/div/div[3]/div[3]/form/table/tbody/tr[2]/td/input")).click();
            Thread.sleep(5000L);
            assertEquals("Collection Comment1 \n posted on 0m ago by admin",
                         selenium.getText("//div[4]/div/div[2]/table/tbody/tr/td/div"),
                         "Added comment failed :");

            //Delete Comment
            driver.findElement(By.id("closeC0")).click();
            Thread.sleep(3000L);
            assertTrue(selenium.isTextPresent("WSO2 Carbon"), "Comment Delete pop-up title failed :");
            assertTrue(selenium.isTextPresent("exact:Are you sure you want to delete this comment?"),
                       "Comment Delete pop-up  message failed :");
            selenium.click("//button");
            Thread.sleep(2000L);
            new GregUserLogout().userLogout(driver);
            log.info("********GRegCollectionSeleniumTest testAddComment() - Passed ***********");

        } catch (WebDriverException e) {
            log.info("Failed to add a comment to collection  - WebDriver Exception :" + e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_addComment");
            new GregUserLogout().userLogout(driver);
            Thread.sleep(3000L);
            throw new WebDriverException("Failed to add a comment to collection :" + e.getMessage());
        } catch (Exception e) {
            log.info("Failed to add a comment to collection " + e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_addComment");
            new GregUserLogout().userLogout(driver);
            Thread.sleep(3000L);
            throw new Exception("Failed to add a comment to collection :" + e.getMessage());
        }
    }

    @Test(groups = {"wso2.greg"}, description = "apply a tag to a collection", priority = 3)
    private void testAddTagToCollection() throws Exception {
        String collectionPath = "/selenium_root/collection_root/tag/a1";
        String tag = "Collection_tag1";

        try {
            userLogin();
            gotoDetailViewTab();

            addCollection(collectionPath);      //Create Collection  1
            Thread.sleep(2000L);
            assertEquals(collectionPath, selenium.getValue("//input"),
                         "New Created Collection does not Exists :");

            //Apply Tag
            driver.findElement(By.id("tagsIconMinimized")).click();
            Thread.sleep(2000L);
            //click on Add New Tag
            driver.findElement(By.linkText("Add New Tag")).click();
            Thread.sleep(2000L);
            driver.findElement(By.id("tfTag")).sendKeys(tag);
            driver.findElement(By.xpath("//div[2]/input[3]")).click();
            Thread.sleep(6000L);
            selenium.mouseOver("//div[12]/div[3]/a");
            Thread.sleep(2000L);
            //Delete Tag
            driver.findElement(By.xpath("//div[12]/div[3]/a[2]/img")).click();
            Thread.sleep(3000L);
            assertTrue(selenium.isTextPresent("WSO2 Carbon"), "Delete Tag Pop-up Title fail :");
            assertTrue(selenium.isTextPresent("exact:Are you sure you want to delete this tag?"),
                       "Delete Tag Pop-up Message fail :");
            //click on "yes" button
            selenium.click("//button");
            selenium.waitForPageToLoad("30000");
            //Sign out
            new GregUserLogout().userLogout(driver);
            log.info("********GRegCollectionSeleniumTest addTagToCollection() - Passed ***********");

        } catch (WebDriverException e) {
            log.info("Failed to apply tag  to collection - WebDriver Exception :" + e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_addTagToCollection");
            new GregUserLogout().userLogout(driver);
            Thread.sleep(3000L);
            throw new WebDriverException("Failed to apply tag  to collection :" + e.getMessage());
        } catch (Exception e) {
            log.info("Failed to apply tag  to collection :" + e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_addTagToCollection");
            new GregUserLogout().userLogout(driver);
            Thread.sleep(3000L);
            throw new Exception("Failed to apply tag  to collection:" + e.getMessage());
        }
    }

    @Test(groups = {"wso2.greg"}, description = "apply a lifecycle to a collection", priority = 4)
    public void testAddLifeCycleToCollection() throws Exception {
        String collectionPath = "/selenium_root/collection_root/lifecycle/a1";

        try {
            userLogin();
            gotoDetailViewTab();

            //Create Collection  1
            addCollection(collectionPath);
            Thread.sleep(2000L);
            assertEquals(collectionPath, selenium.getValue("//input"),
                         "New Created Collection does not Exists :");

            //Add LifeCycle
            selenium.click("id=lifecycleIconMinimized");
            Thread.sleep(3000L);
            selenium.click("link=Add Lifecycle");
            Thread.sleep(4000L);
            assertTrue(selenium.isTextPresent("Enable Lifecycle"),
                       "Enable LifeCycle Text does not appear :");
            assertEquals("Add", selenium.getValue("//div[3]/div[3]/form/table/tbody/tr[2]/td/input"),
                         "Lifecycle Add Button does not appear :");
            assertEquals("Cancel", selenium.getValue("//div[3]/div[3]/form/table/tbody/tr[2]/td/input[2]"),
                         "Lifecycle Cancel button does not appear");
            // select ServiceLifeCycle
            selenium.click("//div[3]/div[3]/form/table/tbody/tr[2]/td/input");
            Thread.sleep(5000L);
            assertTrue(selenium.isTextPresent("Development"),
                       "Service Life cycle default state does not exists:");

            promoteState();
            assertTrue(selenium.isTextPresent("Testing"),
                       "Service Life cycle Testing State fail:");

            promoteState();
            assertTrue(selenium.isTextPresent("Production"),
                       "Service Life Cycle Production State fail:");

            //Delete LifeCycle
            driver.findElement(By.xpath("//div[3]/div[2]/table/tbody/tr/td/div/a")).click();
            Thread.sleep(3000L);
            assertTrue(selenium.isTextPresent("WSO2 Carbon"), "Delete Lifecycle pop-up Title fail:");
            assertTrue(selenium.isTextPresent("exact:Are you sure you want to delete'ServiceLifeCycle' permanently?"),
                       "Delete Lifecycle pop-up message fail :");
            driver.findElement(By.xpath("//button")).click();

            new GregUserLogout().userLogout(driver);             //Sign out
            log.info("********GRegCollectionSeleniumTest addLifeCycleToCollection() - Passed ***********");

        } catch (WebDriverException e) {
            log.info("Failed to apply Lifecycle  to collection:- WebDriver Exception :" + e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_addLifeCycleToCollection");
            new GregUserLogout().userLogout(driver);
            Thread.sleep(3000L);
            throw new WebDriverException("Failed to apply Lifecycle  to collection:" + e.getMessage());
        } catch (Exception e) {
            log.info("Failed to apply Lifecycle  to collection: :" + e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_addLifeCycleToCollection");
            new GregUserLogout().userLogout(driver);
            Thread.sleep(3000L);
            throw new Exception("Failed to apply Lifecycle  to collection:" + e.getMessage());
        }
    }

    @Test(groups = {"wso2.greg"}, description = "apply a rating to a collection", priority = 5)
    public void testAddRatingToCollection() throws Exception, IOException {
        String collectionPath = "/selenium_root/collection_root/rating/a1";

        try {
            userLogin();
            gotoDetailViewTab();

            addCollection(collectionPath);                 //Create Collection  1
            Thread.sleep(2000L);
            assertEquals(collectionPath, selenium.getValue("//input"), "New Created Collection does not Exists :");

            // Add rating 1
            driver.findElement(By.xpath("//img[3]")).click();
            Thread.sleep(2000L);
            assertTrue(selenium.isTextPresent("(1.0)"), "Rating 1 has failed :");

            // Add rating 2
            driver.findElement(By.xpath("//img[5]")).click();
            Thread.sleep(2000L);
            assertTrue(selenium.isTextPresent("(2.0)"), "Rating 2 has failed :");

            // Add rating 3
            driver.findElement(By.xpath("//img[7]")).click();
            Thread.sleep(2000L);
            assertTrue(selenium.isTextPresent("(3.0)"), "Rating 3 has failed :");

            // Add rating 4
            driver.findElement(By.xpath("//img[9]")).click();
            Thread.sleep(2000L);
            assertTrue(selenium.isTextPresent("(4.0)"), "Rating 4 has failed :");

            // Add rating 5
            driver.findElement(By.xpath("//img[11]")).click();
            Thread.sleep(2000L);
            assertTrue(selenium.isTextPresent("(5.0)"), "Rating 5 has failed :");

            //Sign out
            new GregUserLogout().userLogout(driver);
            log.info("********GRegCollectionSeleniumTest addRatingToCollection() - Passed ***********");

        } catch (WebDriverException e) {
            log.info("Failed to add a rating to collection: - WebDriver Exception :" + e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_addRatingToCollection");
            new GregUserLogout().userLogout(driver);
            Thread.sleep(3000L);
            throw new WebDriverException("Failed to add a rating to collection:" + e.getMessage());
        } catch (Exception e) {
            log.info("Failed to add a rating to collection:- Fail :" + e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_addRatingToCollection");
            new GregUserLogout().userLogout(driver);
            Thread.sleep(3000L);
            throw new Exception("Failed to add a rating to collection:" + e.getMessage());
        }
    }

    @Test(groups = {"wso2.greg"}, description = "rename a collection collection", priority = 6)
    private void testRenameCollection() throws Exception {
        String collectionPath = "/selenium_root/collection_root/rename/a1";
        String rename = "renameda1";

        try {
            userLogin();
            gotoDetailViewTab();

            addCollection(collectionPath);                 //Create Collection  1
            Thread.sleep(2000L);
            assertEquals(collectionPath, selenium.getValue("//input"), "New Created Collection does not Exists :");

            findLocation("/selenium_root/collection_root/rename");
            assertTrue(selenium.isTextPresent("a1"), "Collection a1 does not Exists :");

            //Rename Collection
            driver.findElement(By.id("actionLink1")).click();
            Thread.sleep(2000L);
            driver.findElement(By.linkText("Rename")).click();
            Thread.sleep(2000L);

            driver.findElement(By.id("resourceEdit1")).clear();
            driver.findElement(By.id("resourceEdit1")).sendKeys(rename);
            Thread.sleep(2000L);
            driver.findElement(By.xpath("//tr[6]/td/table/tbody/tr[2]/td/input")).click();
            Thread.sleep(4000L);
            assertTrue(selenium.isTextPresent("WSO2 Carbon"), "rename pop-up title fail :");
//            assertTrue(selenium.isTextPresent("Successfully renamed collection."), "rename pop-up message fail:");
            selenium.click("//button");
            Thread.sleep(3000L);
            assertTrue(selenium.isTextPresent(rename), "Renamed Collection does not Exists :");
            //Sign out
            new GregUserLogout().userLogout(driver);
            log.info("********GRegCollectionSeleniumTest renameCollection() - Passed ***********");
        } catch (WebDriverException e) {
            log.info("Failed to rename collection: - WebDriver Exception :" + e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_addRatingToCollection");
            new GregUserLogout().userLogout(driver);
            Thread.sleep(3000L);
            throw new WebDriverException("Failed to rename collection:" + e.getMessage());
        } catch (Exception e) {
            log.info("GRegCollectionSeleniumTest addRatingToCollection()- Fail :" + e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_addRatingToCollection");
            new GregUserLogout().userLogout(driver);
            Thread.sleep(3000L);
            throw new Exception("Failed to rename collection:" + e.getMessage());
        }

    }

    @Test(groups = {"wso2.greg"}, description = "move a collection", priority = 7)
    private void testMoveCollection() throws Exception {
        String collectionPath1 = "/selenium_root/collection_root/move/collection1/a1";
        String collectionPath2 = "/selenium_root/collection_root/move/collection2/b1";
        String movePath = "/selenium_root/collection_root/move/collection2/b1";

        try {
            userLogin();
            gotoDetailViewTab();

            addCollection(collectionPath1);   //Create Collection  1
            Thread.sleep(2000L);
            assertEquals(collectionPath1, selenium.getValue("//input"),
                         "New Created Collection1 does not Exists :");
            driver.findElement(By.xpath("//input")).clear();

            findLocation("/");

            addCollection(collectionPath2);          //Create Collection  2
            Thread.sleep(2000L);
            assertEquals(collectionPath2, selenium.getValue("//input"),
                         "New Created Collection does not Exists :");

            findLocation("/selenium_root/collection_root/move/collection1");
            assertTrue(selenium.isTextPresent("a1"), "a1 Collection does not Exists :");

            driver.findElement(By.id("actionLink1")).click();            //move Collection
            Thread.sleep(2000L);
            driver.findElement(By.linkText("Move")).click();
            Thread.sleep(2000L);
            driver.findElement(By.id("move_destination_path1")).sendKeys(movePath);
            Thread.sleep(4000L);
            driver.findElement(By.xpath("//tr[5]/td/table/tbody/tr[2]/td/input")).click();
            Thread.sleep(3000L);
            assertTrue(selenium.isTextPresent("WSO2 Carbon"), "Move pop-up window Title fail");
            assertTrue(selenium.isTextPresent("Successfully moved collection."),
                       "Move pop-up window message fail");
            selenium.click("//button");

            findLocation(movePath);
            assertTrue(selenium.isTextPresent("a1"), "Moved Collection a1 does not Exists :");

            findLocation("/selenium_root/collection_root/move/collection1");
            assertFalse(selenium.isTextPresent("a1"), "a1 Collection has not been moved :");

            //Sign out
            new GregUserLogout().userLogout(driver);
            log.info("********GRegCollectionSeleniumTest moveCollection() - Passed ***********");
        } catch (WebDriverException e) {
            log.info("GRegCollectionSeleniumTest moveCollection() - WebDriver Exception :" +
                     e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_moveCollection");
            new GregUserLogout().userLogout(driver);
            Thread.sleep(3000L);
            throw new WebDriverException("Failed to Move Collection :" + e.getMessage());
        } catch (Exception e) {
            log.info("GRegCollectionSeleniumTest moveCollection()- Fail :" + e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_moveCollection");
            new GregUserLogout().userLogout(driver);
            Thread.sleep(3000L);
            throw new Exception("Failed to Move Collection :" + e.getMessage());
        }
    }


    @Test(groups = {"wso2.greg"}, description = "copy a collection", priority = 8)
    private void testcopyCollection() throws Exception {
        String collectionPath1 = "/selenium_root/collection_root/copy/collection1/a1";
        String collectionPath2 = "/selenium_root/collection_root/copy/collection2/b1";

        try {
            userLogin();
            gotoDetailViewTab();

            addCollection(collectionPath1);            //Create Collection  1
            Thread.sleep(2000L);
            assertEquals(collectionPath1, selenium.getValue("//input"),
                         "New Created Collection1 does not Exists :");

            findLocation("/");
            addCollection(collectionPath2);             //Create Collection  2
            Thread.sleep(2000L);
            assertEquals(collectionPath2, selenium.getValue("//input"),
                         "New Created Collection2 does not Exists :");

            findLocation("/selenium_root/collection_root/copy/collection1");

            //click on Actions drop down
            driver.findElement(By.id("actionLink1")).click();
            Thread.sleep(2000L);
            //click on copy link
            driver.findElement(By.linkText("Copy")).click();
            Thread.sleep(2000L);
            driver.findElement(By.id("copy_destination_path1")).sendKeys(collectionPath2);
            //click on copy button
            driver.findElement(By.xpath("//td/table/tbody/tr[2]/td/input")).click();
            Thread.sleep(4000L);
            assertTrue(driver.getPageSource().contains("WSO2 Carbon"),
                       "Copy Collection pop-up Title Failed:");
            assertTrue(driver.getPageSource().contains("Successfully copied collection."),
                       "Copy Collection pop-up Message Failed :");
            //click on OK button popup window
            driver.findElement(By.xpath("//button")).click();
            Thread.sleep(3000L);

            findLocation(collectionPath2);
            assertTrue(selenium.isTextPresent("a1"), "Copied a1 collection does not Exists :");

            findLocation("/selenium_root/collection_root/copy/collection1");
            assertTrue(selenium.isTextPresent("a1"), "Copied a1 collection does not Exists :");
            //Sign out
            new GregUserLogout().userLogout(driver);
            log.info("********GRegCollectionSeleniumTest copyCollection() - Passed ***********");
        } catch (WebDriverException e) {
            log.info("GRegCollectionSeleniumTest moveCollection() - WebDriver Exception :"
                     + e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_copyCollection");
            new GregUserLogout().userLogout(driver);
            Thread.sleep(3000L);
            throw new WebDriverException("Failed to Move Collection :" + e.getMessage());
        } catch (Exception e) {
            log.info("GRegCollectionSeleniumTest copyCollection()- Fail :"
                     + e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_copyCollection");
            new GregUserLogout().userLogout(driver);
            Thread.sleep(3000L);
            throw new Exception("Failed to Move Collection :" + e.getMessage());
        }
    }

    @Test(groups = {"wso2.greg"}, description = "copy a collection", priority = 9)
    private void testDeleteCollection() throws Exception {
        String collectionPath1 = "/selenium_root/collection_root/delete/collection1/a1";
        try {
            userLogin();
            gotoDetailViewTab();

            addCollection(collectionPath1);               //Create Collection  1
            Thread.sleep(2000L);
            assertEquals(collectionPath1, selenium.getValue("//input"),
                         "New Created Collection does not Exists :");

            findLocation("/selenium_root/collection_root/delete/");

            //Delete Collection
            driver.findElement(By.id("actionLink1")).click();
            Thread.sleep(2000L);
            driver.findElement(By.linkText("Delete")).click();
            Thread.sleep(3000L);
            assertTrue(selenium.isTextPresent("WSO2 Carbon"),
                       "Delete Collection pop-up Title does not appear :");
            assertTrue(selenium.isTextPresent("exact:Are you sure you want to delete " +
                                              "'/selenium_root/collection_root/delete/collection1'" +
                                              " permanently?"), "Delete Collection pop-up message" +
                                                                " fail:");
            selenium.click("//button");

            //Sign out
            new GregUserLogout().userLogout(driver);
            log.info("********GRegCollectionSeleniumTest deleteCollection() - Passed ***********");
        } catch (WebDriverException e) {
            log.info("GRegCollectionSeleniumTest deleteCollection() - WebDriver Exception :"
                     + e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_deleteCollection");
            new GregUserLogout().userLogout(driver);
            Thread.sleep(3000L);
            throw new WebDriverException("Failed to find Location collection/resource path:"
                                         + e.getMessage());
        } catch (Exception e) {
            log.info("GRegCollectionSeleniumTest deleteCollection()- Fail :"
                     + e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_deleteCollection");
            new GregUserLogout().userLogout(driver);
            Thread.sleep(3000L);
            throw new Exception("Failed to find Location collection/resource path:"
                                + e.getMessage());
        }
    }


    @AfterClass(alwaysRun = true)
    public void cleanup() {
        driver.quit();
    }


    private void promoteState() throws Exception {
        try {
            driver.findElement(By.id("option0")).click();
            Thread.sleep(2000L);
            driver.findElement(By.id("option1")).click();
            Thread.sleep(2000L);
            driver.findElement(By.id("option2")).click();
            Thread.sleep(2000L);
            // promote
            driver.findElement(By.xpath("//tr[2]/td/div/input")).click();
            Thread.sleep(4000L);
            assertTrue(selenium.isTextPresent("WSO2 Carbon"),
                       "Life Cycle Promote pop-up Title fail :");
            assertTrue(selenium.isTextPresent("Successfully Promoted"),
                       "Life Cycle promote pop-up message fail :");
            // click on OK button
            selenium.click("css=button[type=\"button\"]");
            Thread.sleep(3000L);

        } catch (WebDriverException e) {
            log.info("GRegCollectionSeleniumTest-promoteState() - WebDriver Exception :" +
                     e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_promoteState");
            throw new WebDriverException("Failed to promote Lifecycle :" + e.getMessage());
        } catch (Exception e) {
            log.info("GRegCollectionSeleniumTest-promoteState() Fail :" + e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_promoteState");
            throw new Exception("Failed to promote Lifecycle:" + e.getMessage());
        }
    }


    private void addCollection(String collectionPath) throws Exception {
        try {
            driver.findElement(By.linkText("Add Collection")).click();
            Thread.sleep(3000L);
            driver.findElement(By.id("collectionName")).sendKeys(collectionPath);
            driver.findElement(By.id("colDesc")).sendKeys("Selenium Test");
            //Click on Add button
            driver.findElement(By.xpath("//div[7]/form/table/tbody/tr[5]/td/input")).click();
            Thread.sleep(3000L);
            assertTrue(selenium.isTextPresent("WSO2 Carbon"),
                       "Add new Collection pop -up title failed :");
            assertTrue(selenium.isTextPresent("Successfully added new collection."),
                       "Add new Collection pop -up message failed :");
            //click on OK button
            selenium.click("//button");
        } catch (WebDriverException e) {
            log.info("Failed to create a new collection:- WebDriver Exception :" + e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_addCollection");
            throw new WebDriverException("Failed to create a new collection:" + e.getMessage());
        } catch (Exception e) {
            log.info("Failed to create a new collection: :" + e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_addCollection");
            throw new Exception("Failed to create a new collection:" + e.getMessage());
        }
    }

    //
    private void gotoDetailViewTab() throws Exception {
        try {
            driver.findElement(By.linkText("Browse")).click();           //Click on Browse link
            Thread.sleep(5000L);
            driver.findElement(By.id("stdView")).click();                    //Go to Detail view Tab
            Thread.sleep(3000L);
            assertTrue(selenium.isTextPresent("Browse"), "Browse Detail View Page fail :");
            assertTrue(selenium.isTextPresent("Metadata"), "Browse Detail View Page fail :");
            assertTrue(selenium.isTextPresent("Entries"), "Browse Detail View Page fail :");
        } catch (WebDriverException e) {
            log.info("Failed to goto Detail view Tab- WebDriver Exception :" + e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_gotoDetailViewTab");
            throw new WebDriverException("Failed to goto Detail view Tab:" + e.getMessage());
        } catch (Exception e) {
            log.info("Failed to goto Detail view Tab :" + e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_gotoDetailViewTab");
            throw new Exception("Failed to goto Detail view Tab:" + e.getMessage());
        }
    }

    private void findLocation(String path) throws Exception {
        try {
            driver.findElement(By.id("uLocationBar")).clear();
            driver.findElement(By.id("uLocationBar")).sendKeys(path);
            driver.findElement(By.xpath("//input[2]")).click();
            Thread.sleep(3000L);
        } catch (WebDriverException e) {
            log.info("Failed to find Location collection/resource path:- WebDriver Exception :" +
                     e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_findLocation");
            throw new WebDriverException("Failed to find Location collection/resource path:" +
                                         e.getMessage());
        } catch (Exception e) {
            log.info("Failed to find Location collection/resource path:" + e.getMessage());
            new SeleniumScreenCapture().getScreenshot(driver, "greg",
                                                      "GRegCollectionSeleniumTest_findLocation");
            throw new Exception("Failed to find Location collection/resource path:" +
                                e.getMessage());
        }
    }


    private void userLogin() {
        new GregUserLogin().userLogin(driver, username, password);
        selenium.waitForPageToLoad("30000");
        assertTrue(selenium.isTextPresent("WSO2 Governance Registry Home"), "GReg Home page not present :");
    }

}
