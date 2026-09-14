import { jsPDF } from 'jspdf';
import { VideoEditorialProfile } from '../types';
import { getPacingStyleConfig } from '../components/PacingStyleSummaryCard';

interface ExportOptions {
  analysis: VideoEditorialProfile;
  videoTitle?: string;
  creatorName?: string;
}

const sanitizeFilename = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 40) || 'video';
};

/**
 * Exports the editorial analysis as a formatted, indented JSON file
 */
export const exportToJson = ({ analysis, videoTitle, creatorName }: ExportOptions) => {
  const exportPayload = {
    metadata: {
      exported_at: new Date().toISOString(),
      generator: 'YouTube Video Editorial Analyzer',
      video_title: videoTitle || 'Untitled Video',
      creator_name: creatorName || 'Unknown Creator',
      scope_analyzed: analysis.scope_analyzed || {
        mode: 'standard',
        label: 'Standard Analysis Pass'
      }
    },
    editorial_profile: {
      editorial_archetype: analysis.editorialArchetype,
      primary_pacing_style: {
        category: getPacingStyleConfig(analysis).category,
        title: getPacingStyleConfig(analysis).title,
        tagline: getPacingStyleConfig(analysis).tagline,
        traits: getPacingStyleConfig(analysis).traits.map(t => ({
          label: t.label,
          value: t.value,
          detail: t.detail
        }))
      },
      metrics: analysis.metrics,
      narrative_summary: analysis.narrativeSummary,
      cutting_style: analysis.cutting_style,
      visual_identity: analysis.visual_identity,
      audio_landscape: analysis.audio_landscape,
      structural_timeline: analysis.structural_timeline,
      macro_pacing_curve: analysis.macro_pacing_curve || [],
      creator_replication_guide: analysis.creator_replication_guide
    }
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  const safeName = sanitizeFilename(videoTitle || creatorName || 'editorial');
  link.download = `editorial-analysis-${safeName}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generates and downloads a clean, multi-page PDF report of the analysis
 */
export const exportToPdf = ({ analysis, videoTitle, creatorName }: ExportOptions) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 20) {
      doc.addPage();
      y = margin;
      drawHeaderFooter();
    }
  };

  const drawHeaderFooter = () => {
    const pageNum = doc.getNumberOfPages();
    // Header line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, 25, pageWidth - margin, 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('YouTube Video Editorial Analysis Report', margin, 20);
    doc.text(`Page ${pageNum}`, pageWidth - margin, 20, { align: 'right' });

    // Footer
    doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
    doc.text('Generated with YouTube Video Editorial Analyzer', margin, pageHeight - 10);
    doc.text(new Date().toLocaleDateString(), pageWidth - margin, pageHeight - 10, { align: 'right' });
  };

  // 1. Cover / Top Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, contentWidth, 68, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(248, 250, 252);
  doc.text('VIDEO EDITORIAL ANALYSIS REPORT', margin + 16, y + 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  const videoLabel = videoTitle ? `Video: "${videoTitle.substring(0, 70)}"` : 'Video Analysis';
  const creatorLabel = creatorName ? ` | Creator: ${creatorName}` : '';
  doc.text(`${videoLabel}${creatorLabel}`, margin + 16, y + 42);
  doc.text(`Scope: ${analysis.scope_analyzed?.label || 'Comprehensive'} | Generated: ${new Date().toLocaleDateString()}`, margin + 16, y + 54);

  y += 82;

  // 2. Archetype & Pacing Style Box
  const pacingConfig = getPacingStyleConfig(analysis);
  
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(margin, y, contentWidth, 54, 4, 4, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 54, 4, 4, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(14, 165, 233); // sky-500
  doc.text('EDITORIAL ARCHETYPE & PACING STYLE', margin + 14, y + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(analysis.editorialArchetype, margin + 14, y + 29);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Primary Pacing Style: ${pacingConfig.category} (${pacingConfig.title})`, margin + 14, y + 43);

  y += 64;

  // 3. Key Metrics Table Grid
  const colW = contentWidth / 4;
  const metricsBoxHeight = 44;

  const metricItems = [
    { label: 'Avg Shot Length', value: `${analysis.metrics.average_shot_length_seconds}s`, sub: 'Pacing cadence' },
    { label: 'Pacing Score', value: `${analysis.metrics.pacing_score}/100`, sub: analysis.metrics.pacing_classification },
    { label: 'B-Roll Ratio', value: `~${analysis.metrics.b_roll_ratio_percent}%`, sub: 'Visual inserts' },
    { label: 'Visual Density', value: analysis.metrics.visual_density, sub: 'Information density' }
  ];

  metricItems.forEach((m, i) => {
    const mx = margin + i * colW;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(mx + 2, y, colW - 4, metricsBoxHeight, 3, 3, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, mx + 8, y + 12);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(m.value, mx + 8, y + 26);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(m.sub, mx + 8, y + 36);
  });

  y += metricsBoxHeight + 16;

  // Section Heading Helper
  const drawSectionHeading = (title: string) => {
    checkPageBreak(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(title, margin, y);
    doc.setDrawColor(14, 165, 233);
    doc.setLineWidth(1.5);
    doc.line(margin, y + 4, margin + 40, y + 4);
    y += 18;
  };

  // 4. Narrative Summary
  drawSectionHeading('1. Narrative & Editorial Summary');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const narrativeLines = doc.splitTextToSize(analysis.narrativeSummary, contentWidth);
  narrativeLines.forEach((line: string) => {
    checkPageBreak(13);
    doc.text(line, margin, y);
    y += 13;
  });
  y += 10;

  // 5. Cutting & Camera Dynamics
  drawSectionHeading('2. Cutting Style & Camera Rhythm');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Primary Transitions:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(analysis.cutting_style.primary_transitions.join(', '), margin + 105, y);
  y += 14;

  const rhythmDetails = [
    { label: 'Shot Rhythm:', text: analysis.cutting_style.shot_rhythm_description },
    { label: 'Punch-ins & Zooms:', text: analysis.cutting_style.punch_in_zooms_usage },
    { label: 'Framing & Camera Movement:', text: analysis.cutting_style.framing_and_camera_movement }
  ];

  rhythmDetails.forEach(item => {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(item.label, margin, y);
    y += 11;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const lines = doc.splitTextToSize(item.text, contentWidth - 10);
    lines.forEach((l: string) => {
      checkPageBreak(12);
      doc.text(l, margin + 8, y);
      y += 12;
    });
    y += 4;
  });
  y += 6;

  // 6. Visual Identity & Color Palette
  drawSectionHeading('3. Visual Identity & Color Palette');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  // Swatches
  analysis.visual_identity.color_grade_palette.forEach(color => {
    checkPageBreak(18);
    // Draw hex color box
    try {
      doc.setFillColor(color.hex);
      doc.roundedRect(margin, y - 9, 12, 12, 2, 2, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, y - 9, 12, 12, 2, 2, 'S');
    } catch {
      // fallback if hex format unrecognized
      doc.setFillColor(150, 150, 150);
      doc.rect(margin, y - 9, 12, 12, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${color.name} (${color.hex}):`, margin + 18, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const descWidth = contentWidth - 120;
    const descLines = doc.splitTextToSize(color.description, descWidth);
    doc.text(descLines[0] || '', margin + 115, y);
    y += 15;
  });

  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Lighting Style: ', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(analysis.visual_identity.lighting_style, margin + 75, y);
  y += 13;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Motion Graphics: ', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(analysis.visual_identity.motion_graphics_and_text, margin + 85, y);
  y += 16;

  // 7. Audio Landscape
  drawSectionHeading('4. Audio Landscape & Sound Design');
  const audioPoints = [
    { label: 'Music & Tempo:', text: analysis.audio_landscape.music_tempo_and_genre },
    { label: 'Vocal Delivery & Ducking:', text: analysis.audio_landscape.vocal_delivery_and_ducking },
    { label: 'Sound FX & Foley:', text: analysis.audio_landscape.sound_design_elements.join(', ') },
    { label: 'Inferred Moods:', text: analysis.audio_landscape.inferred_moods.join(' • ') }
  ];

  audioPoints.forEach(pt => {
    checkPageBreak(18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(pt.label, margin, y);
    y += 11;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const lines = doc.splitTextToSize(pt.text, contentWidth - 10);
    lines.forEach((l: string) => {
      checkPageBreak(12);
      doc.text(l, margin + 8, y);
      y += 12;
    });
    y += 3;
  });
  y += 8;

  // 8. Structural Timeline Breakdown
  if (analysis.structural_timeline && analysis.structural_timeline.length > 0) {
    drawSectionHeading('5. Structural Scene & Beat Timeline');
    
    analysis.structural_timeline.forEach((beat, index) => {
      checkPageBreak(40);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(14, 165, 233); // sky-500
      doc.text(`[${beat.timestamp}]`, margin + 8, y + 12);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${beat.title} (${beat.beat_type})`, margin + 80, y + 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Technique: ${beat.editorial_technique.substring(0, 90)}`, margin + 8, y + 24);

      y += 38;
    });
    y += 6;
  }

  // 9. Replication Blueprint
  drawSectionHeading('6. Creator Replication Playbook');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Essential Editorial Rules:', margin, y);
  y += 13;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  analysis.creator_replication_guide.essential_rules.forEach((rule, idx) => {
    checkPageBreak(14);
    const ruleLines = doc.splitTextToSize(`${idx + 1}. ${rule}`, contentWidth - 10);
    ruleLines.forEach((rl: string) => {
      doc.text(rl, margin + 8, y);
      y += 12;
    });
  });

  y += 8;
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Recommended Tools & FX:', margin, y);
  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const toolLines = doc.splitTextToSize(analysis.creator_replication_guide.recommended_tools_or_fx.join(', '), contentWidth - 10);
  toolLines.forEach((tl: string) => {
    doc.text(tl, margin + 8, y);
    y += 12;
  });

  // Apply header & footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Draw header and footer
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, 25, pageWidth - margin, 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('YouTube Video Editorial Analysis Report', margin, 18);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, 18, { align: 'right' });

    doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
    doc.text('YouTube Video Editorial Analyzer | Confidential Report', margin, pageHeight - 10);
    doc.text(new Date().toLocaleDateString(), pageWidth - margin, pageHeight - 10, { align: 'right' });
  }

  const safeName = sanitizeFilename(videoTitle || creatorName || 'editorial-report');
  doc.save(`editorial-analysis-${safeName}.pdf`);
};
