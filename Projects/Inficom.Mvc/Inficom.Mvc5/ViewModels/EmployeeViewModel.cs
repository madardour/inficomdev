using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Inficom.Mvc5.ViewModels
{
    public class EmployeeViewModel
    {
        public Int32? EmployeeID { get; set; }

        public String LastName { get; set; }

        public String FirstName { get; set; }

        public String Title { get; set; }

        [DataType(DataType.Date)]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime? BirthDate { get; set; }

        public DateTime? HireDate { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Moet groter zijn dan 0")]      
        public Decimal Salaris { get; set; }

        public String Notes { get; set; }
    }
}