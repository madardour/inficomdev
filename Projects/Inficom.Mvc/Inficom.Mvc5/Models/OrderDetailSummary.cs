using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace Inficom.Mvc5.Models
{
    public class OrderDetailSummary
    {
        [Key, ForeignKey("Order"), Column(Order = 0)]
        public Int32 OrderID { get; set; }
        [Key, ForeignKey("Product"), Column(Order = 1)]
        public Int32 ProductID { get; set; }

        public String ProductName { get; set; }

        public Decimal? UnitPrice { get; set; }

        public Int16? Quantity { get; set; }

        public Decimal Discount { get; set; }

        public Decimal? Total { get; set; }

        public virtual Order Order { get; set; }

        public virtual Product Product { get; set; }
    }
}