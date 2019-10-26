using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Inficom.Auth.Startup))]
namespace Inficom.Auth
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
