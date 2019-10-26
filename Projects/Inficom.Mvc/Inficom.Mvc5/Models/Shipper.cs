using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Web;

namespace Inficom.Mvc5.Models
{
    public class Shipper
    {
        public Int32? ShipperID { get; set; }

        public String CompanyName { get; set; }

        public String Phone { get; set; }

        public virtual Collection<Order> Orders { get; set; }
    }
}