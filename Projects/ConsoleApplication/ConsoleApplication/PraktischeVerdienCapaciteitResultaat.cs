//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace ConsoleApplication
{
    using System;
    using System.Collections.Generic;
    
    public partial class PraktischeVerdienCapaciteitResultaat
    {
        public int Id { get; set; }
        public int InkomstenVerhoudingenSetId { get; set; }
        public decimal BedrRvcPerUurZonderReductie { get; set; }
        public decimal UrenomvangResterendeVerdienCapaciteit { get; set; }
        public decimal ReductieFactor { get; set; }
        public decimal ResterendeVerdienCapaciteitPerUur { get; set; }
        public decimal ResterendeVerdienCapaciteitPerMaand { get; set; }
        public decimal ArbeidsOngeschiktheidsPercentage { get; set; }
        public decimal PercentageResterendeVerdienCapaciteit { get; set; }
        public bool IndicatieMaatgevend { get; set; }
    
        public virtual InkomstenVerhoudingenSet InkomstenVerhoudingenSet { get; set; }
    }
}
