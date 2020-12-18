using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Web;

namespace Inficom.Mvc5.Models
{
    public class Order
    {
        public Int32? OrderID { get; set; }

        public String CustomerID { get; set; }

        public Int32? EmployeeID { get; set; }

        public DateTime? OrderDate { get; set; }

        public DateTime? RequiredDate { get; set; }

        public DateTime? ShippedDate { get; set; }

        public Int32? ShipVia { get; set; }

        public Decimal? Freight { get; set; }

        public String ShipName { get; set; }

        public String ShipAddress { get; set; }

        public String ShipCity { get; set; }

        public String ShipRegion { get; set; }

        public String ShipPostalCode { get; set; }

        public String ShipCountry { get; set; }

        //public ICollection<OrderRelated> RelatedOrders { get; private set; }

        //public virtual Customer Customers { get; set; }

        //public virtual Employee Employees { get; set; }

        //public virtual Shipper Shippers { get; set; }

    }
}