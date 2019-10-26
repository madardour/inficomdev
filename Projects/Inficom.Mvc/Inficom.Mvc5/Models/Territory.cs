using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Inficom.Mvc5.Models
{
    public class Territory
    {
        public Int32? TerritoryID { get; set; }
        public String TerritoryDescription { get; set; }
        public virtual Region Region { get; set; }

    }
}