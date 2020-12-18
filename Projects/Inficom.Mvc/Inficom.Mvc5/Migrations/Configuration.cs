namespace Inficom.Mvc5.Migrations
{
    using Inficom.Mvc5.Models;
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Data.Entity.ModelConfiguration;
    using System.Linq;

    internal sealed class Configuration : DbMigrationsConfiguration<Inficom.Mvc5.Models.InficomMvcContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = false;
        }

        protected override void Seed(Inficom.Mvc5.Models.InficomMvcContext context)
        {
            //  This method will be called after migrating to the latest version.

            //  You can use the DbSet<T>.AddOrUpdate() helper extension method 
            //  to avoid creating duplicate seed data.
        }
    }

    public class OrderConfiguration : EntityTypeConfiguration<Order>
    {
        public OrderConfiguration()
        {
            //HasMany<Order>(c => c.RelatedOrders).WithMany()
            //                               .Map(cs =>
            //                               {
            //                                   cs.ToTable("RelatedOrders");
            //                                   cs.MapLeftKey("OrderID");
            //                                   cs.MapRightKey("RelOrderID");
            //                               });
            //HasOptional<Order>(t => t.RelatedOrders).WithRequired().WillCascadeOnDelete(true);

        }
    }
}
