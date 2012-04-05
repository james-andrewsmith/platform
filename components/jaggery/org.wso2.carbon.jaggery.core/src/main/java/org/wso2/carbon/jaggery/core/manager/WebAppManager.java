package org.wso2.carbon.jaggery.core.manager;

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.mozilla.javascript.BaseFunction;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Function;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.wso2.carbon.hostobjects.file.FileHostObject;
import org.wso2.carbon.jaggery.core.ScriptReader;
import org.wso2.carbon.jaggery.core.modules.JaggeryHostObject;
import org.wso2.carbon.jaggery.core.plugins.WebAppFileManager;
import org.wso2.carbon.scriptengine.cache.ScriptCachingContext;
import org.wso2.carbon.scriptengine.engine.RhinoEngine;
import org.wso2.carbon.scriptengine.exceptions.ScriptException;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.reflect.Method;
import java.net.JarURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.util.List;

public class WebAppManager extends CommonManager {

    private static final Log log = LogFactory.getLog(WebAppManager.class);
    public static final String CORE_MODULE_NAME = "core";

    private BaseFunction requestFunc = null;
    private BaseFunction responseFunc = null;
    private BaseFunction sessionFunc = null;

    public WebAppManager(String jaggeryDir) throws ScriptException {
        super(jaggeryDir);
        init();
    }

    private void init() throws ScriptException {
        //define require() global method
        try {
            Method method = CommonManager.class.getDeclaredMethod(
                    "require", Context.class, Scriptable.class, Object[].class, Function.class);
            getEngine().defineFunction("require", method,  ScriptableObject.READONLY);
        } catch (NoSuchMethodException e) {
            log.error(e.getMessage(), e);
            throw new ScriptException(e);
        }
        //define request, response, session constructors
        List<JaggeryHostObject> hostObjects = getModuleManager().getModules().get(CORE_MODULE_NAME).getJaggeryHostObjects();
        for (JaggeryHostObject hostObject : hostObjects) {
            if ("Request".equals(hostObject.getName())) {
                requestFunc = hostObject.getConstructor();
            } else if ("Response".equals(hostObject.getName())) {
                responseFunc = hostObject.getConstructor();
            } else if ("Session".equals(hostObject.getName())) {
                sessionFunc = hostObject.getConstructor();
            }
            if ((requestFunc != null) && (responseFunc != null) && (sessionFunc != null)) {
                break;
            }
        }
    }

    protected void initContext(JaggeryContext context) {
        super.initContext(context);
        //define static properties
        //ScriptableObject jaggery = (ScriptableObject) ScriptableObject.getProperty(
        //        context.getScope(), CommonManager.JAGGERY_PREFIX);
        defineProperties(context, context.getScope());
    }

    protected void initModule(String module, ScriptableObject object, JaggeryContext context) {
        if (CORE_MODULE_NAME.equals(module)) {
            defineProperties(context, object);
        }
    }

    public void execute(HttpServletRequest request, HttpServletResponse response) throws IOException {
        InputStream sourceIn = request.getServletContext().getResourceAsStream(request.getServletPath());
        if (sourceIn == null) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND, request.getRequestURI());
            return;
        }
        try {
            //We need to get-in to the Rhino context
            RhinoEngine.enterContext();
            //Creating an OutputStreamWritter to write content to the servletResponse
            OutputStream out = response.getOutputStream();
            JaggeryContext webAppContext = getJaggeryContext(out, request, response);
            initContext(webAppContext);
            RhinoEngine.putContextProperty(FileHostObject.JAVASCRIPT_FILE_MANAGER,
                    new WebAppFileManager(request.getServletContext()));
            getEngine().exec(new ScriptReader(sourceIn), webAppContext.getScope(), getScriptCachingContext(request));
            out.flush();
        } catch (ScriptException e) {
            String msg = e.getMessage();
            log.error(msg, e);
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, msg);
        } finally {
            //Exiting from the context
            RhinoEngine.exitContext();
        }
    }

    private void defineProperties(JaggeryContext context, ScriptableObject jaggery) {
        Context cx = RhinoEngine.enterContext();
        WebAppContext ctx = (WebAppContext) context;

        RhinoEngine.defineProperty(jaggery, "request",
                requestFunc.construct(cx, jaggery, new Object[]{ctx.getServletRequest()}),
                ScriptableObject.READONLY);
        RhinoEngine.defineProperty(jaggery, "response",
                responseFunc.construct(cx, jaggery, new Object[]{ctx.getServletResponse()}),
                ScriptableObject.READONLY);
        RhinoEngine.defineProperty(jaggery, "session",
                sessionFunc.construct(cx, jaggery, new Object[]{ctx.getServletRequest().getSession()}),
                ScriptableObject.READONLY);

        RhinoEngine.exitContext();
    }

    public JaggeryContext getJaggeryContext(OutputStream out,
                                            HttpServletRequest request, HttpServletResponse response) {
        WebAppContext context = new WebAppContext();
        context.setEnvironment(ENV_WEBAPP);
        context.setTenantId("0");
        context.setOutputStream(out);
        context.setServletRequest(request);
        context.setServletResponse(response);
        context.setServletConext(request.getServletContext());
        context.getIncludesCallstack().push(request.getServletPath());
        return context;
    }

    protected static ScriptCachingContext getScriptCachingContext(HttpServletRequest request) throws ScriptException {
        JaggeryContext jaggeryContext = getJaggeryContext();
        String tenantId = jaggeryContext.getTenantId();
        String servletPath = request.getServletPath();
        String[] parts = getKeys(request.getContextPath(), servletPath, servletPath);
        /**
         * tenantId = tenantId
         * context = webapp context
         * path = relative path to the directory of *.js file
         * cacheKey = name of the *.js file being cached
         */
        ScriptCachingContext sctx = new ScriptCachingContext(tenantId, parts[0], parts[1], parts[2]);
        long lastModified = getScriptLastModified(request.getServletContext(), request.getServletPath());
        sctx.setSourceModifiedTime(lastModified);
        return sctx;
    }

    /**
     *
     * @param context in the form of /foo
     * @param parent in the form of /foo/bar/ or /foo/bar/dar.jss
     * @param scriptPath in the form of /foo/bar/mar.jss or bar/mar.jss
     * @return  String[] with keys
     */
    public static String[] getKeys(String context, String parent, String scriptPath) {
        String path;
        String normalizedScriptPath;
        if(scriptPath.startsWith("/")) {
        	normalizedScriptPath = FilenameUtils.normalize(scriptPath, true);
        } else {
        	normalizedScriptPath = FilenameUtils.normalize(FilenameUtils.getFullPath(parent) + scriptPath, true);
        }
        path = FilenameUtils.getFullPath(normalizedScriptPath);
        //remove trailing "/"
        path = path.substring(0, path.length() - 1);
        normalizedScriptPath = "/" + FilenameUtils.getName(normalizedScriptPath);
        return new String[] {
                context,
                path,
                normalizedScriptPath
        };
    }

    public static long getScriptLastModified(ServletContext context, String scriptPath) throws ScriptException {
        long result = -1;
        URLConnection uc = null;
        try {
            URL scriptUrl = context.getResource(canonicalURI(scriptPath));
            if (scriptUrl == null) {
                String msg = "Requested resource " + scriptPath + " cannot be found";
                log.error(msg);
                throw new ScriptException(msg);
            }
            uc = scriptUrl.openConnection();
            if (uc instanceof JarURLConnection) {
                result = ((JarURLConnection) uc).getJarEntry().getTime();
            } else {
                result = uc.getLastModified();
            }
        } catch (IOException e) {
            log.warn("Error getting last modified time for " + scriptPath, e);
            result = -1;
        } finally {
            if (uc != null) {
                try {
                    uc.getInputStream().close();
                } catch (IOException e) {
                    log.error("Error closing input stream for script " + scriptPath, e);
                }
            }
        }
        return result;
    }

    private static String canonicalURI(String s) {
        if (s == null) {
        	return null;
        }
        StringBuilder result = new StringBuilder();
        final int len = s.length();
        int pos = 0;
        while (pos < len) {
            char c = s.charAt(pos);
            if (isPathSeparator(c)) {
                /*
                * multiple path separators.
                * 'foo///bar' -> 'foo/bar'
                */
                while (pos + 1 < len && isPathSeparator(s.charAt(pos + 1))) {
                    ++pos;
                }

                if (pos + 1 < len && s.charAt(pos + 1) == '.') {
                    /*
                    * a single dot at the end of the path - we are done.
                    */
                    if (pos + 2 >= len) {
                    	break;
                    }

                    switch (s.charAt(pos + 2)) {
                        /*
                        * self directory in path
                        * foo/./bar -> foo/bar
                        */
                        case '/':
                        case '\\':
                            pos += 2;
                            continue;

                            /*
                            * two dots in a path: go back one hierarchy.
                            * foo/bar/../baz -> foo/baz
                            */
                        case '.':
                            // only if we have exactly _two_ dots.
                            if (pos + 3 < len && isPathSeparator(s.charAt(pos + 3))) {
                                pos += 3;
                                int separatorPos = result.length() - 1;
                                while (separatorPos >= 0 &&
                                        !isPathSeparator(result
                                                .charAt(separatorPos))) {
                                    --separatorPos;
                                }
                                if (separatorPos >= 0) {
                                    result.setLength(separatorPos);
                                }
                                continue;
                            }
                    }
                }
            }
            result.append(c);
            ++pos;
        }
        return result.toString();
    }

    private static boolean isPathSeparator(char c) {
        return (c == '/' || c == '\\');
    }
}
