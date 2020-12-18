using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace Inficom.Mvc5.Models
{
    public class OrderRelated
    {
        [Key, ForeignKey("OrgOrder"), Column(Order = 0)]
        public Int32 OrgOrderID { get; set; }
        [Key, ForeignKey("RelOrder"), Column(Order = 1)]
        public Int32 RelOrderID { get; set; }
        public Order OrgOrder { get; set; }
        public Order RelOrder { get; set; }
    }
}