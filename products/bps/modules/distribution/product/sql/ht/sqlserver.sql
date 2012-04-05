CREATE TABLE DEADLINE (id BIGINT NOT NULL, DEADLINE_DATE DATETIME NOT NULL, NAME VARCHAR(255) NOT NULL, STATUS_TOBE_ACHIEVED VARCHAR(255) NOT NULL, TASK_ID BIGINT, PRIMARY KEY (id));
CREATE TABLE EVENT (id BIGINT NOT NULL, DETAILS VARCHAR(255), TIMESTAMP DATETIME, TYPE VARCHAR(255), TASK_ID BIGINT, PRIMARY KEY (id));
CREATE TABLE GENERIC_HUMAN_ROLE (GHR_ID BIGINT NOT NULL, type VARCHAR(23), TASK_ID BIGINT, PRIMARY KEY (GHR_ID));
CREATE TABLE HTJOB (id BIGINT NOT NULL, DETAILS VARCHAR(4096), NAME VARCHAR(255), NODEID VARCHAR(255), SCHEDULED BIT NOT NULL, TASKID BIGINT NOT NULL, TIME BIGINT NOT NULL, TRANSACTED BIT NOT NULL, TYPE VARCHAR(255) NOT NULL, PRIMARY KEY (id));
CREATE TABLE HUMANROLE_ORGENTITY (HUMANROLE_ID BIGINT, ORGENTITY_ID BIGINT);
CREATE TABLE MESSAGE (MESSAGE_ID BIGINT NOT NULL, DATA CLOB, HEADER CLOB, MESSAGE_TYPE VARCHAR(255), NAME VARCHAR(512), TASK_ID BIGINT, PRIMARY KEY (MESSAGE_ID));
CREATE TABLE OPENJPA_SEQUENCE_TABLE (ID TINYINT NOT NULL, SEQUENCE_VALUE BIGINT, PRIMARY KEY (ID));
CREATE TABLE ORG_ENTITY (ORG_ENTITY_ID BIGINT NOT NULL, ORG_ENTITY_NAME VARCHAR(255), ORG_ENTITY_TYPE VARCHAR(255), PRIMARY KEY (ORG_ENTITY_ID));
CREATE TABLE PRESENTATION_ELEMENT (id BIGINT NOT NULL, CONTENT VARCHAR(255), XML_LANG VARCHAR(255), PE_TYPE VARCHAR(31), CONTENT_TYPE VARCHAR(255), TASK_ID BIGINT, PRIMARY KEY (id));
CREATE TABLE PRESENTATION_PARAM (id BIGINT NOT NULL, NAME VARCHAR(255), type VARCHAR(20), VALUE VARCHAR(255), TASK_ID BIGINT, PRIMARY KEY (id));
CREATE TABLE TASK (id BIGINT NOT NULL, ACTIVATION_TIME DATETIME, COMPLETE_BY_TIME DATETIME, CREATED_ON DATETIME, ESCALATED BIT, EXPIRATION_TIME DATETIME, NAME VARCHAR(255) NOT NULL, PRIORITY INT NOT NULL, SKIPABLE BIT, START_BY_TIME DATETIME, STATUS VARCHAR(255) NOT NULL, STATUS_BEFORE_SUSPENSION VARCHAR(255), TENANT_ID INT NOT NULL, TYPE VARCHAR(255) NOT NULL, UPDATED_ON DATETIME, FAILURE_MESSAGE BIGINT, INPUT_MESSAGE BIGINT, OUTPUT_MESSAGE BIGINT, PARENTTASK_ID BIGINT, PRIMARY KEY (id));
CREATE TABLE TASK_ATTACHMENT (id BIGINT NOT NULL, ACCESS_TYPE VARCHAR(255), ATTACHED_AT DATETIME, CONTENT_TYPE VARCHAR(255), ATTACHMENT_NAME VARCHAR(255), VALUE VARCHAR(255), TASK_ID BIGINT, ATTACHED_BY BIGINT, PRIMARY KEY (id));
CREATE TABLE TASK_COMMENT (id BIGINT NOT NULL, COMMENT_TEXT VARCHAR(8192), COMMENTED_BY VARCHAR(100), COMMENTED_ON DATETIME, MODIFIED_BY VARCHAR(100), MODIFIED_ON DATETIME, TASK_ID BIGINT, PRIMARY KEY (id));
CREATE INDEX I_DEDLINE_TASK ON DEADLINE (TASK_ID);
CREATE INDEX I_EVENT_TASK ON EVENT (TASK_ID);
CREATE INDEX I_GNRC_RL_TASK ON GENERIC_HUMAN_ROLE (TASK_ID);
CREATE INDEX I_HMNRTTY_ELEMENT ON HUMANROLE_ORGENTITY (ORGENTITY_ID);
CREATE INDEX I_HMNRTTY_HUMANROLE_ID ON HUMANROLE_ORGENTITY (HUMANROLE_ID);
CREATE INDEX I_MESSAGE_TASK ON MESSAGE (TASK_ID);
CREATE INDEX I_PRSNMNT_DTYPE ON PRESENTATION_ELEMENT (PE_TYPE);
CREATE INDEX I_PRSNMNT_TASK ON PRESENTATION_ELEMENT (TASK_ID);
CREATE INDEX I_PRSNPRM_TASK ON PRESENTATION_PARAM (TASK_ID);
CREATE INDEX I_TASK_FAILUREMESSAGE ON TASK (FAILURE_MESSAGE);
CREATE INDEX I_TASK_INPUTMESSAGE ON TASK (INPUT_MESSAGE);
CREATE INDEX I_TASK_OUTPUTMESSAGE ON TASK (OUTPUT_MESSAGE);
CREATE INDEX I_TASK_PARENTTASK ON TASK (PARENTTASK_ID);
CREATE INDEX I_TSK_MNT_ATTACHEDBY ON TASK_ATTACHMENT (ATTACHED_BY);
CREATE INDEX I_TSK_MNT_TASK ON TASK_ATTACHMENT (TASK_ID);
CREATE INDEX I_TSK_MNT_TASK1 ON TASK_COMMENT (TASK_ID);
