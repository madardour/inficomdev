using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Web;

namespace Inficom.Mvc5.Models
{
    public partial class Category
    {
        public Int32? CategoryID { get; set; }

        public String CategoryName { get; set; }

        public String Description { get; set; }

        public Byte[] Picture { get; set; }

        public virtual Collection<Product> Products { get; set; }
    }
}