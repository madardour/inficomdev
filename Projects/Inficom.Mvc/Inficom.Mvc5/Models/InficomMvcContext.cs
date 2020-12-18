using Inficom.Mvc5.Migrations;
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

        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderRelated> RelatedOrders { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();
            modelBuilder.Conventions.Remove<OneToManyCascadeDeleteConvention>();

            modelBuilder.Configurations.Add(new OrderConfiguration());
        }

    }
}