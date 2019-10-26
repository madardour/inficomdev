using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace Inficom.Mvc5.Models
{
    public class EmployeeTerritory
    {
        [Key, ForeignKey("Employee"), Column(Order = 0)]
        public Int32 EmployeeID { get; set; }
        [Key, ForeignKey("Territory"), Column(Order = 1)]
        public Int32 TerritoryID { get; set; }

        public virtual Employee Employee { get; set; }
        public virtual Territory Territory { get; set; }
    }
}