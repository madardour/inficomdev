using Inficom.Mvc5.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Inficom.Mvc5.Controllers
{
    public class InficomController : Controller
    {
        private InficomMvcContext db = new InficomMvcContext();

        // GET: Inficom
        public ActionResult Index(string v)
        {
            if (string.IsNullOrEmpty(v))
                v = "Index";

            return View(v);
        }

        public ActionResult InficomView(string pv)
        {
            if (string.IsNullOrEmpty(pv))
                pv = "Index";

            return PartialView(pv);
        }

        public String Search(string q)
        {
            if (string.IsNullOrEmpty(q))
                q = "Inficom";

            return "Je hebt gezocht naar " + q;
        }

    }
}