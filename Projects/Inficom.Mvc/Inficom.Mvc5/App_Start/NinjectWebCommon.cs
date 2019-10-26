[assembly: WebActivatorEx.PreApplicationStartMethod(typeof(Inficom.Mvc5.App_Start.NinjectWebCommon), "Start")]
[assembly: WebActivatorEx.ApplicationShutdownMethodAttribute(typeof(Inficom.Mvc5.App_Start.NinjectWebCommon), "Stop")]

namespace Inficom.Mvc5.App_Start
{
    using System;
    using System.Web;
    using Inficom.Mvc5.Repositories;
    using Inficom.Mvc5.Repositories.Interfaces;
    using Microsoft.Web.Infrastructure.DynamicModuleHelper;

    using Ninject;
    using Ninject.Web.Common;
    using Ninject.Web.Common.WebHost;

    public static class NinjectWebCommon 
    {
        private static readonly Bootstrapper bootstrapper = new Bootstrapper();

        /// <summary>
        /// Starts the application
        /// </summary>
        public static void Start() 
        {
            DynamicModuleUtility.RegisterModule(typeof(OnePerRequestHttpModule));
            DynamicModuleUtility.RegisterModule(typeof(NinjectHttpModule));
            bootstrapper.Initialize(CreateKernel);
        }
        
        /// <summary>
        /// Stops the application.
        /// </summary>
        public static void Stop()
        {
            bootstrapper.ShutDown();
        }
        
        /// <summary>
        /// Creates the kernel that will manage your application.
        /// </summary>
        /// <returns>The created kernel.</returns>
        private static IKernel CreateKernel()
        {
            var kernel = new StandardKernel();
            try
            {
                kernel.Bind<Func<IKernel>>().ToMethod(ctx => () => new Bootstrapper().Kernel);
                kernel.Bind<IHttpModule>().To<HttpApplicationInitializationHttpModule>();

                RegisterServices(kernel);
                return kernel;
            }
            catch
            {
                kernel.Dispose();
                throw;
            }
        }

        /// <summary>
        /// Load your modules or register your services here!
        /// </summary>
        /// <param name="kernel">The kernel.</param>
        private static void RegisterServices(IKernel kernel)
        {
            //System.Web.Mvc.DependencyResolver.SetResolver(new Repositories.NinjectDependencyResolver(kernel));

            kernel.Bind<IProductRepository>().To<ProductRepository>();
            kernel.Bind<IEmployeeRepository>().To<EmployeeRepository>();
            //kernel.Bind(typeof(IRepository<>)).To(typeof(ProductRepository)).InRequestScope();
        }        
    }
}
