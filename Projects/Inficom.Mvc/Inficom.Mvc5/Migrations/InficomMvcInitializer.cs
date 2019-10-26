using Inficom.Mvc5.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Inficom.Mvc5.Migrations
{
    public class InficomMvcInitializer : System.Data.Entity.DropCreateDatabaseAlways<InficomMvcContext>
    {
        protected override void Seed(InficomMvcContext context)
        {
            var categories = new List<Category>
            {
                new Category { }
            };
        }
    }
}