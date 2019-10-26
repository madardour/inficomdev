using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;
using System.Linq;
using System.Web;

namespace Inficom.Mvc5.Models
{
    public class InficomMvcContext : DbContext
    {
        public InficomMvcContext() : base("InficomMvcContext")
        {
            this.Database.Log = s => System.Diagnostics.Debug.WriteLine(s);
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<Territory> Territories { get; set; }
        public DbSet<EmployeeTerritory> EmployeeTerritories { get; set; }
        public DbSet<CustomerCustomerDemo> CustomerCustomerDemos { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();
        }

        public System.Data.Entity.DbSet<Inficom.Mvc5.Models.Category> Categories { get; set; }

        public System.Data.Entity.DbSet<Inficom.Mvc5.Models.Supplier> Suppliers { get; set; }

        public System.Data.Entity.DbSet<Inficom.Mvc5.Models.Employee> Employees { get; set; }
    }
}