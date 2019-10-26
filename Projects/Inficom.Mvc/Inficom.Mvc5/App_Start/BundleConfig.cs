using System.Web;
using System.Web.Optimization;

namespace Inficom.Mvc5
{
    public class BundleConfig
    {
        // For more information on bundling, visit https://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.validate*"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at https://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/bootstrap.css",
                      "~/Content/site.css"));

            bundles.Add(new ScriptBundle("~/bundles/ajax").Include(
                      "~/Scripts/jquery.unobtrusive-ajax*"));

            bundles.Add(new ScriptBundle("~/bundles/site").Include(
                      "~/Scripts/Inficom/site*"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryui").Include(
                    "~/Scripts/jquery-ui-{version}.js"));

            var bundle = new ScriptBundle("~/bundles/ckeditor").Include(
                "~/Scripts/ckeditor/ckeditor.js");
            //skip transformation. Result is that files are only bundled, but not minified.
            bundle.Transforms.Clear();
            bundles.Add(bundle);

            var bundleAdapters = new ScriptBundle("~/bundles/ckeditorAdapters").Include(
                "~/Scripts/ckeditor/config.js",
                "~/Scripts/ckeditor/styles.js",
                "~/Scripts/ckeditor/adapters/jquery.js");
            bundles.Add(bundleAdapters);
        }
    }
}
