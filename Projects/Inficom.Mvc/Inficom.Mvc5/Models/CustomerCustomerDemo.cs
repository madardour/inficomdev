using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace Inficom.Mvc5.Models
{
    public class CustomerCustomerDemo
    {
        [Key, ForeignKey("Customer"), Column(Order = 0)]
        public String CustomerID { get; set; }
        [Key, ForeignKey("CustomerDemographic"), Column(Order = 1)]
        public String CustomerTypeID { get; set; }

        public virtual Customer Customer { get; set; }
        public virtual CustomerDemographic CustomerDemographic { get; set; }
    }
}