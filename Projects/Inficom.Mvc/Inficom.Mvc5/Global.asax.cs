using AutoMapper;
using log4net;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Reflection;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace Inficom.Mvc5
{
    public class MvcApplication : System.Web.HttpApplication
    {
        private static ILog _myLogger;

        public static ILog MyLogger
        {
            get { return _myLogger ?? (_myLogger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType)); }
        }

        protected void Application_Start()
        {
            //Database.SetInitializer(new Migrations.InficomMvcInitializer());

            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            log4net.Config.XmlConfigurator.Configure();
            Mapper.Initialize(cfg => cfg.CreateMap<Models.Employee, ViewModels.EmployeeViewModel>());
        }

        protected void Session_Start(object sender, EventArgs e)
        {
            MDC.Set("user", "Bravo user");
        }

    }
}
