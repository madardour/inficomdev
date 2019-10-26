using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Inficom.Mvc5.Controllers
{
    public class HomeController : Controller
    {
        public ViewResult Index()
        {
            return View();
        }

        public ActionResult About(string name)
        {
            ViewBag.Message = "Your application description page.";
            ViewBag.Name = name;

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public JsonResult CheckName(string FirstName)
        {
            var result = FirstName.Equals("Mohamed");
            return Json(result, JsonRequestBehavior.AllowGet);
        }
    }
}