using Inficom.Mvc5.Controllers;
using System.Web.Mvc;
using Xunit;

namespace Inficom.UnitTest.Controllers
{
    public class HomeControllerTest
    {
        [Fact]
        public void IndexShouldAskForDefaultView()
        {
            // Arrange
            HomeController controller = new HomeController();
            // Act
            ViewResult result = controller.Index();
            // Assert
            Assert.NotNull(result);
            Assert.Null(result.ViewName);
        }
    }
}
