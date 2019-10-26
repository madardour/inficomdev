using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Inficom.Mvc5.Models
{
    public class CustomerDemographic
    {
        [Key]
        [StringLength(10)]
        public String CustomerTypeID { get; set; }
        public String CustomerDesc { get; set; }
    }
}